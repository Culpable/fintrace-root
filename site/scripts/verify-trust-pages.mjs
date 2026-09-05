import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const outputDirectory = resolve(import.meta.dirname, '../dist')
const routes = {
  About: 'about/index.html',
  Contact: 'contact/index.html',
  Privacy: 'privacy-policy/index.html',
}

/** Return visible, page-specific text from the single main landmark. */
function visibleMainText(html) {
  const matches = [...html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi)]
  if (matches.length !== 1) throw new Error(`Expected one main landmark; found ${matches.length}`)
  return matches[0][1]
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39|apos);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const results = {}
for (const [name, output] of Object.entries(routes)) {
  const characters = [...visibleMainText(readFileSync(resolve(outputDirectory, output), 'utf8'))].length
  results[name] = { output, pageSpecificCharacters: characters }
  if (characters <= 500) throw new Error(`${name} exposes only ${characters} page-specific characters; expected more than 500`)
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`)
