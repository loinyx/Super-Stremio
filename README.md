# Super Stremio

Um assistente que instala um setup completo de Stremio na sua conta, usando as
**suas** contas nos serviços envolvidos. Onze addons, cerca de 150 prateleiras de
catálogo em português, streams via debrid e legendas em PT-BR.

## Como funciona

O site é feito só de arquivos estáticos. Não existe servidor por trás, então não
existe onde guardar o que você digita, nem se alguém quisesse.

Três coisas saem do seu navegador, e só elas:

- os `fetch` de `manifest.json` para validar cada addon, indo direto ao addon
- as chamadas a `api.strem.io`, quando você escolhe instalar entrando na conta
- o download dos arquivos de configuração, que são públicos e não contêm chave

A senha do Stremio, se você optar por usá-la, vai do seu navegador direto para o
`api.strem.io`. Ela nunca é guardada, nem no navegador.

## Três formas de instalar

1. **Entrar na conta** e o site grava a coleção. É a única que arruma a ordem.
2. **Links `stremio://`**, um por addon, sem senha nenhuma.
3. **Baixar a lista em JSON**, para quem já usa um gerenciador de addons.

As opções 2 e 3 partem da coleção padrão do Stremio como base, para preservar os
addons que ele protege, entre eles o de arquivos locais.

## O que este repositório não contém

Nenhuma credencial. Os arquivos em `public/templates/` são configurações de
catálogo e de filtro com todas as chaves removidas. Quem instala preenche as
próprias, dentro de cada serviço.

O script `scripts/sanitize.mjs` é o que produz esses arquivos a partir de um
export pessoal, e ele **falha com código 1** se qualquer coisa com formato de
credencial sobrar na saída. A varredura tem duas camadas: uma conhece os valores
secretos da origem e recusa que reapareçam, a outra procura formato de
credencial e pega campo que o sanitizador ainda não conhece.

## Rodando local

```bash
python3 serve.py     # http://localhost:4173
npm test             # 46 testes, sem dependência nenhuma
```

Não há build e não há `node_modules`. O que está no ar é o que está aqui.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `public/index.html` | o assistente, nove telas |
| `public/js/catalog.js` | os onze addons e o que cada um exige |
| `public/js/stremio.js` | cliente da API e a regra de merge da coleção |
| `public/js/validation.js` | validação batendo no manifesto de cada addon |
| `public/js/keys.js` | aferição das chaves de MDBList e TorBox |
| `public/js/wizard.js` | estado do fluxo, persistido no navegador |
| `scripts/sanitize.mjs` | remove credenciais e gera os templates públicos |
| `docs/superpowers/specs/` | o desenho, com o que a investigação apurou |

## Detalhes que custaram caro

**A identidade de um addon é a `transportUrl`, não o `manifest.id`.** As cinco
configurações do AIOMetadata devolvem todas o mesmo id. Deduplicar por id
colapsa as cinco numa só, e a instalação termina com uma prateleira em vez de
cinco.

**A coleção padrão do Stremio traz addons protegidos**, entre eles o de arquivos
locais em `127.0.0.1:11470`. Gravar uma lista por cima sem preservá-los tira a
reprodução de vídeo local de quem instalou.

**A instância pública do AIOMetadata não traz chave do MDBList.** Como 86 das
150 prateleiras vêm de lá, sem a chave de quem instala mais da metade carrega
vazia. Por isso é o primeiro passo do assistente.

**O TorBox não manda cabeçalho de CORS.** O navegador não consegue conferir a
chave dele, e o assistente diz isso em vez de mostrar um sinal verde que não
significa nada. O MDBList permite, e ali a conferência é real.
