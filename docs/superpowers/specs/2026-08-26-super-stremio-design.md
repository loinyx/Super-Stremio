# Super Stremio

Site que instala um setup de Stremio inteiro na conta de quem visita, usando as
contas do visitante em vez das do autor.

Data: 2026-08-26

## Problema

O backup de origem tem 11 addons. Oito deles carregam credenciais do autor
dentro da URL de transporte, então o arquivo não pode ser compartilhado como está.
Trocar a credencial por um campo de formulário resolve só um caso dos três:

| Addon | O que é pessoal na URL | Natureza |
| --- | --- | --- |
| Torrentio TB | `torbox=<API KEY>` em texto puro | substituição de string |
| AIOMetadata (5 configs) | UUID de config | config mora no servidor do ElfHosted |
| AIOStreams | UUID mais blob cifrado | idem, cifrado com a senha do dono |
| Community Subtitles | token de conta no path | conta de usuário |
| opensubtitles PRO | nada, só idioma | pode ser publicado como está |
| Brazuca, Cinemeta | nada | idem |

O caso difícil não é a chave em texto puro. São os configs hospedados, onde não
existe valor a substituir: o visitante precisa criar a config dele no serviço de
origem e voltar com o identificador.

## Decisões tomadas

1. **Escopo: setup completo, tudo ou nada.** O site assume que o visitante vai ter
   as mesmas contas. Em troca, a tela de entrada lista explicitamente o que ele
   precisa ter antes de começar, para ninguém instalar e achar que quebrou.
2. **Instalação: login no Stremio e escrita da coleção inteira.** Como o
   stremio-addon-manager faz. Não são 11 links soltos.
3. **AIOMetadata: manter as cinco configs.** Fiel ao setup original, cada uma vira
   uma linha separada na tela inicial. Custa cinco repetições no wizard.
4. **Formato: wizard guiado que explica o porquê de cada peça.** O site instrui e
   a pessoa executa. Não vai chamar API interna de addon para criar config sozinho.
5. **Visual: linguagem Apple.** Um acento (azul), um sistema de raio, dois temas.

## Achados da investigação

Tudo abaixo foi verificado contra os serviços reais, não presumido.

**A API do Stremio aceita chamada de navegador.** `api.strem.io` responde
`Access-Control-Allow-Origin: *` no preflight e na resposta. Um site estático
consegue logar e escrever a coleção sem backend. É isso que sustenta a promessa de
que a senha não passa por servidor de terceiro.

**A coleção padrão tem addons protegidos.** `addonCollectionGet` sem authKey
devolve 7 addons oficiais, entre eles `org.stremio.local`
(`http://127.0.0.1:11470/local-addon/manifest.json`, `protected: true`) e o
Cinemeta. O backup de origem **não** inclui o Local Files. Escrever essa lista por
cima removeria o addon de arquivos locais do visitante. Por isso o push é merge,
não overwrite.

**O AIOMetadata tem export e import de catálogos.** O bundle expõe validação de
arquivo de export (`version`, `catalogs[]` com `id`, `name`, `type`, `source`) e
uma função que **importa a partir de uma URL**, o que permite hospedar os JSONs e
o visitante só colar o endereço. O export já é consciente de privacidade: pula
catálogos marcados `user-specific` e `private list`.

**O AIOMetadata público não traz MDBList.** `GET /api/config` em
`aiometadata.elfhosted.com` responde:

```
hasBuiltInTmdb:    true
hasBuiltInTvdb:    true
hasBuiltInMdblist: false
maxCatalogs:       200
collectionImportCatalogCap: 400
```

**86 dos ~150 catálogos do setup vêm do MDBList.** Sem chave própria do visitante,
mais da metade das prateleiras carrega vazia. Isso torna a chave do MDBList um
passo obrigatório e o primeiro do fluxo. Os ~150 catálogos cabem no limite de 200.

**O AIOStreams tem export e import de configuração em JSON**, e a config é
cifrada com a senha do dono. Consequência de produto: as chaves de debrid o
visitante digita dentro da interface do AIOStreams, não no site. Isso não é
limitação, é o que permite compartilhar a configuração sem entregar as contas.

## Arquitetura

Site estático, sem backend. Vite, React, TypeScript, Tailwind, publicado em
repositório público. A ausência de servidor é requisito de produto, não escolha de
infraestrutura: é o que torna verificável a frase "nada do que você digita passa
por mim".

Saem do navegador do visitante apenas: os `fetch` de `manifest.json` para validar
cada addon, indo direto ao addon; as chamadas a `api.strem.io`; e o download dos
JSONs de catálogo, que são arquivos públicos sem segredo.

### Módulos

**`scripts/sanitize.mjs`** (offline, na máquina do autor). Entrada: backup do
Stremio, 5 exports do AIOMetadata, 1 export do AIOStreams. Saída:
`public/templates/*.json` e `src/catalog/addons.generated.ts`, com todo segredo
trocado por marcador. Nenhum arquivo de entrada entra no git. Único ponto onde os
dados do autor são tocados.

**`src/catalog/`** Dados dos 11 addons: id, nome, o que exige do visitante
(`nada` | `chave-torbox` | `uuid-aiometadata` | `url-completa`), molde da
`transportUrl`. Fonte única da verdade. Mudar o setup no futuro é regerar este
arquivo, não mexer em tela.

**`src/wizard/`** Máquina de passos. Cada passo é `{id, titulo, exige, valida,
render}`. Estado preenchido persistido em `localStorage`. A senha do Stremio nunca
entra nesse estado.

**`src/validation/`** Recebe o valor colado, monta a `transportUrl` final, faz
`fetch` do `manifest.json` e confere se o `id` bate com o esperado. É o que impede
alguém de terminar o fluxo com 11 addons quebrados.

**`src/stremio/`** `login`, `addonCollectionGet`, `addonCollectionSet`, mais a
regra de merge: puxa a coleção atual, preserva os `protected`, aplica a lista na
ordem, deduplica por `manifest.id`. Antes de escrever, oferece baixar a coleção
atual como JSON.

**`src/ui/`** Componentes do wizard, conforme o mockup aprovado.

## Fluxo

Entrada com o que a pessoa precisa ter em mãos e os links de cadastro, depois:

1. Chave do MDBList. Grátis, resolve 86 prateleiras.
2. Chave do TorBox. Resolve o Torrentio inteiro por substituição de string.
3. AIOMetadata, cinco fatias. Para cada uma: link do configurador, link do JSON
   para importar, campo do UUID. A chave do MDBList fica com botão de copiar ao
   lado, porque é colada lá dentro.
4. AIOStreams. Importar a configuração, preencher o TorBox na interface deles,
   voltar com o endereço.
5. Legendas. O opensubtitles PRO não pede nada. O Community Subtitles pede conta.
6. Revisão dos 11 com o resultado real da validação.
7. Login no Stremio, backup da coleção atual, instalar.

Links usados, todos verificados respondendo 200:
`mdblist.com`, `mdblist.com/preferences/`, `torbox.app`, `torbox.app/settings`,
`aiometadata.elfhosted.com/configure`,
`aiostreams.elfhosted.com/stremio/configure`,
`stremio-community-subtitles.top`, `web.stremio.com`.

## Erros

Cada passo trava até validar e mostra o motivo real da falha (404, id diferente,
UUID cortado, timeout), nunca "algo deu errado". Se o `addonCollectionSet` falhar,
a coleção antiga continua intacta e o backup baixado serve para restaurar.

## Testes

- Varredura na saída do sanitizador que **falha o build** se sobrar qualquer coisa
  com formato de chave. É o teste mais importante do projeto.
- Unitários no merge: protegido preservado, dedupe por id, ordem mantida.
- Unitários no montador de URL: Torrentio com chave, opensubtitles em base64.
- Playwright no caminho feliz com `api.strem.io` mockada.

## Riscos

**Vazamento por descuido.** Os exports de origem podem trazer um campo secreto não
previsto. Mitigação: teste de varredura mais revisão do diff antes de publicar.

**Reuso do UUID de origem.** Alguém copiar o identificador do autor em vez de criar o
próprio. Mitigação: o backup original nunca entra no repositório e os templates
publicados não contêm UUID nenhum.

**Instabilidade das interfaces de terceiros.** Se o AIOStreams mudar a tela, a
instrução fica velha. É o custo aceito ao escolher instruir em vez de automatizar,
e o modo de falha é brando: texto desatualizado, não fluxo quebrado.

## Pendências

Os 6 exports (5 do AIOMetadata, 1 do AIOStreams). Exigem as senhas do autor, então
é ele quem baixa. Sem eles o wizard não tem o que oferecer para importar.
