#!/usr/bin/env node
/**
 * Lê os exports em `privado/`, tira os dados pessoais e escreve os templates
 * públicos em `public/templates/`. Falha com código 1 se sobrar qualquer coisa
 * com cara de credencial na saída.
 *
 * Uso: node scripts/sanitize.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import {
  limparAioMetadata,
  limparAioStreams,
  servicosLigados,
  SEGREDOS_AIOMETADATA,
  SEGREDOS_AIOSTREAMS,
  PERMITIDOS,
} from "./lib/sanitize.mjs"
import { coletarSegredos, procurarVazamentos } from "./lib/secret-scan.mjs"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const entrada = join(raiz, "privado")
const saida = join(raiz, "public", "templates")

const ler = (arquivo) => JSON.parse(readFileSync(join(entrada, arquivo), "utf8"))

function main() {
  mkdirSync(saida, { recursive: true })

  const arquivos = readdirSync(entrada).filter((f) => f.endsWith(".json"))
  const metadados = arquivos.filter((f) => f.startsWith("aiometadata-"))
  const streams = arquivos.filter((f) => f === "aiostreams.json")

  if (metadados.length === 0 && streams.length === 0) {
    erro(`nenhum export encontrado em ${entrada}`)
  }

  const segredos = new Set()
  const produzidos = []

  for (const arquivo of metadados) {
    const origem = ler(arquivo)
    coletarSegredos(origem, SEGREDOS_AIOMETADATA).forEach((s) => segredos.add(s))

    const limpo = limparAioMetadata(origem)
    const nome = arquivo.replace("aiometadata-", "catalogos-")
    escrever(nome, limpo)
    produzidos.push({
      nome,
      rotulo: origem.config?.addonName ?? "?",
      catalogos: limpo.config?.catalogs?.length ?? 0,
    })
  }

  for (const arquivo of streams) {
    const origem = ler(arquivo)
    coletarSegredos(origem, SEGREDOS_AIOSTREAMS).forEach((s) => segredos.add(s))

    const limpo = limparAioStreams(origem)
    escrever("aiostreams.json", limpo)
    produzidos.push({
      nome: "aiostreams.json",
      rotulo: `AIOStreams, debrid a preencher: ${servicosLigados(origem).join(", ") || "nenhum"}`,
      catalogos: limpo.presets?.length ?? 0,
    })
  }

  const vazamentos = varrer(produzidos.map((p) => p.nome), segredos)

  for (const p of produzidos) {
    console.log(`  ${p.nome.padEnd(26)} ${String(p.catalogos).padStart(3)} itens   ${p.rotulo}`)
  }
  console.log(`\n  ${segredos.size} valores secretos vigiados na origem`)

  if (vazamentos.length > 0) {
    console.error("\nVAZAMENTO na saída:")
    for (const v of vazamentos) {
      console.error(`  ${v.arquivo}: ${v.tipo} -> ${mascarar(v.valor)}`)
    }
    process.exit(1)
  }

  console.log("  varredura limpa, nenhuma credencial na saída\n")
}

function escrever(nome, dados) {
  writeFileSync(join(saida, nome), JSON.stringify(dados, null, 2) + "\n")
}

function varrer(nomes, segredos) {
  const todos = []
  for (const nome of nomes) {
    const texto = readFileSync(join(saida, nome), "utf8")
    for (const v of procurarVazamentos(texto, { segredos, permitidos: PERMITIDOS })) {
      todos.push({ arquivo: nome, ...v })
    }
  }
  return todos
}

const mascarar = (v) => (v.length <= 10 ? v : `${v.slice(0, 6)}…${v.slice(-4)}`)

function erro(mensagem) {
  console.error(`sanitize: ${mensagem}`)
  process.exit(1)
}

main()
