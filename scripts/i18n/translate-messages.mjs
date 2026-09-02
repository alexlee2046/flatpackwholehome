#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const sourceLocale = 'en'
const localeNames = {
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese used in Taiwan',
  de: 'German',
  ja: 'Japanese',
  ar: 'Modern Standard Arabic suitable for an international UAE-facing storefront',
  ru: 'Russian',
}
const defaultLocales = Object.keys(localeNames)
const protectedTokenPattern =
  /\b(?:MODULIV|ModuSofa|SnapBed|DDP|USD|SKU|FSC|OEKO-TEX|Stripe|Flat-Pack)\b/g
const emailPattern = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g
const urlPattern = /https?:\/\/[^\s"'<>]+/g
const numberPattern = /(?<!=)\d+(?:[.,]\d+)*/g
const placeholderPattern = /\{\s*([A-Za-z][A-Za-z0-9_]*)\b/g

function parseArguments(argv) {
  const options = {
    catalog: '',
    force: false,
    locales: defaultLocales,
    model: 'gemini-3.7-flash-medium',
    repairIdentical: false,
    write: true,
  }

  for (const argument of argv) {
    if (argument === '--') continue
    if (argument === '--force') options.force = true
    else if (argument === '--repair-identical') options.repairIdentical = true
    else if (argument === '--dry-run') options.write = false
    else if (argument.startsWith('--catalog=')) {
      options.catalog = argument.slice('--catalog='.length).trim()
      if (!/^[a-z0-9-]+$/i.test(options.catalog)) {
        throw new Error(`Invalid catalog name: ${options.catalog}`)
      }
    } else if (argument.startsWith('--locales=')) {
      options.locales = argument
        .slice('--locales='.length)
        .split(',')
        .map((locale) => locale.trim())
        .filter(Boolean)
    } else if (argument.startsWith('--model=')) {
      options.model = argument.slice('--model='.length)
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }

  for (const locale of options.locales) {
    if (!localeNames[locale]) throw new Error(`Unsupported target locale: ${locale}`)
  }

  return options
}

function buildSchema(value) {
  if (Array.isArray(value)) {
    return {
      items: value.length ? buildSchema(value[0]) : {},
      type: 'array',
    }
  }

  if (value && typeof value === 'object') {
    return {
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, buildSchema(child)]),
      ),
      required: Object.keys(value),
      type: 'object',
    }
  }

  return { type: 'string' }
}

function collectStrings(value, currentPath = [], result = []) {
  if (typeof value === 'string') {
    result.push({ path: currentPath.join('.'), value })
    return result
  }

  if (Array.isArray(value)) {
    value.forEach((child, index) => collectStrings(child, [...currentPath, String(index)], result))
    return result
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) =>
      collectStrings(child, [...currentPath, key], result),
    )
  }

  return result
}

function uniqueMatches(value, pattern) {
  return [...new Set(value.match(pattern) ?? [])].sort()
}

function placeholders(value) {
  return [...value.matchAll(placeholderPattern)].map((match) => match[1]).sort()
}

function getIdenticalStrings(source, translated) {
  if (typeof source === 'string') {
    if (source !== translated || !/[A-Za-z]{2}/.test(source)) return undefined
    const unprotectedText = source
      .replace(protectedTokenPattern, '')
      .replace(/(?:https?:\/\/|mailto:|tel:)[^\s]+/gi, '')
      .replace(/[^A-Za-z]/g, '')
    return unprotectedText ? source : undefined
  }

  if (!source || typeof source !== 'object' || Array.isArray(source)) return undefined
  const selected = {}
  for (const [key, value] of Object.entries(source)) {
    const child = getIdenticalStrings(value, translated?.[key])
    if (child !== undefined) selected[key] = child
  }
  return Object.keys(selected).length ? selected : undefined
}

function mergeCatalog(target, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch
  const merged = { ...target }
  for (const [key, value] of Object.entries(patch)) {
    merged[key] =
      value && typeof value === 'object' && !Array.isArray(value)
        ? mergeCatalog(target?.[key], value)
        : value
  }
  return merged
}

function validateTranslation(source, translated, locale) {
  const sourceStrings = collectStrings(source)
  const translatedStrings = new Map(
    collectStrings(translated).map((entry) => [entry.path, entry.value]),
  )
  const errors = []

  if (sourceStrings.length !== translatedStrings.size) {
    errors.push(
      `String count differs: source=${sourceStrings.length}, ${locale}=${translatedStrings.size}`,
    )
  }

  for (const entry of sourceStrings) {
    const target = translatedStrings.get(entry.path)
    if (typeof target !== 'string') {
      errors.push(`${entry.path}: missing string`)
      continue
    }
    if (!target.trim()) errors.push(`${entry.path}: empty translation`)

    const expectedProtectedTokens = uniqueMatches(entry.value, protectedTokenPattern)
    const actualProtectedTokens = uniqueMatches(target, protectedTokenPattern)
    const missingProtectedTokens = expectedProtectedTokens.filter(
      (token) => !actualProtectedTokens.includes(token),
    )
    if (missingProtectedTokens.length) {
      errors.push(
        `${entry.path}: protected tokens missing (${JSON.stringify(missingProtectedTokens)})`,
      )
    }

    for (const [label, pattern] of [
      ['email addresses', emailPattern],
      ['URLs', urlPattern],
    ]) {
      const expected = uniqueMatches(entry.value, pattern)
      const actual = uniqueMatches(target, pattern)
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        errors.push(
          `${entry.path}: ${label} changed (${JSON.stringify(expected)} -> ${JSON.stringify(actual)})`,
        )
      }
    }

    const expectedNumbers = uniqueMatches(entry.value, numberPattern)
    const actualNumbers = uniqueMatches(target, numberPattern)
    const missingNumbers = expectedNumbers.filter((number) => !actualNumbers.includes(number))
    if (missingNumbers.length) {
      errors.push(`${entry.path}: numbers missing (${JSON.stringify(missingNumbers)})`)
    }

    const expectedPlaceholders = placeholders(entry.value)
    const actualPlaceholders = placeholders(target)
    if (JSON.stringify(expectedPlaceholders) !== JSON.stringify(actualPlaceholders)) {
      errors.push(
        `${entry.path}: ICU placeholders changed (${JSON.stringify(expectedPlaceholders)} -> ${JSON.stringify(actualPlaceholders)})`,
      )
    }
  }

  if (errors.length) {
    throw new Error(`Validation failed for ${locale}:\n- ${errors.join('\n- ')}`)
  }
}

function buildPrompt(source, locale) {
  const localeGuidance = {
    'zh-CN': 'Use native Simplified Chinese terminology and punctuation.',
    'zh-TW': 'Use terminology and Traditional Chinese characters natural for Taiwan.',
    de: 'Use concise German retail language and natural compound nouns.',
    ja: 'Use polished, concise Japanese ecommerce language.',
    ar: 'Use clear right-to-left Modern Standard Arabic and natural Arabic punctuation.',
    ru: 'Use natural, concise Russian ecommerce language.',
  }[locale]

  return `Translate every string value in this MODULIV storefront message catalog from English to ${localeNames[locale]} (${locale}).
Return exactly the same JSON structure and keys. Translate values only.

Requirements:
- Natural, premium but restrained outdoor-furniture retail language; accuracy over promotional exaggeration.
- Preserve MODULIV, ModuSofa, SnapBed, DDP, USD, SKU, FSC, OEKO-TEX, Stripe, Flat-Pack, URLs, email addresses, model names, all numbers, units, and ICU placeholders exactly.
- DDP means Delivered Duty Paid. Explain it naturally where context requires, but retain the literal token DDP.
- Do not add facts, legal promises, certifications, availability, or delivery claims.
- Use concise native UI wording and punctuation.
- Translate visible navigation labels, section names, and all-caps editorial eyebrows; never retain English merely as a visual style.
- ${localeGuidance}

SOURCE JSON:\n${JSON.stringify(source, null, 2)}`
}

async function pathExists(candidate) {
  try {
    await access(candidate, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function runAgy(executable, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject(new Error(`AGY exited with ${code}: ${stderr.trim() || stdout.trim()}`))
    })
  })
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const messagesDirectory = path.join(root, 'messages', options.catalog)
  const sourcePath = path.join(messagesDirectory, `${sourceLocale}.json`)
  const sourceText = await readFile(sourcePath, 'utf8')
  const source = JSON.parse(sourceText)
  const sourceHash = createHash('sha256').update(sourceText).digest('hex')
  const statePath = path.join(messagesDirectory, '.translation-state.json')
  const state = (await pathExists(statePath))
    ? JSON.parse(await readFile(statePath, 'utf8'))
    : { locales: {} }
  const executable =
    process.env.AGY_CLI ||
    path.join(homedir(), '.local', 'bin', process.platform === 'win32' ? 'agy.exe' : 'agy')

  if (!(await pathExists(executable))) {
    throw new Error(`AGY CLI was not found at ${executable}. Set AGY_CLI to override it.`)
  }

  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'moduliv-i18n-'))
  const schemaPath = path.join(temporaryDirectory, 'messages.schema.json')

  try {
    for (const locale of options.locales) {
      const current = state.locales?.[locale]
      const targetPath = path.join(messagesDirectory, `${locale}.json`)
      let existingTarget
      let translationSource = source

      if (options.repairIdentical) {
        if (!(await pathExists(targetPath))) {
          console.log(`skip ${locale}: no existing catalog to repair`)
          continue
        }
        existingTarget = JSON.parse(await readFile(targetPath, 'utf8'))
        translationSource = getIdenticalStrings(source, existingTarget)
        if (!translationSource) {
          console.log(`skip ${locale}: no identical English strings`)
          continue
        }
      } else if (
        !options.force &&
        current?.sourceHash === sourceHash &&
        current?.model === options.model
      ) {
        console.log(`skip ${locale}: already current`)
        continue
      }

      await writeFile(schemaPath, `${JSON.stringify(buildSchema(translationSource), null, 2)}\n`)
      console.log(
        `${options.repairIdentical ? 'repair' : 'translate'} ${sourceLocale} -> ${locale} with ${options.model}`,
      )
      const raw = await runAgy(executable, [
        '--print',
        buildPrompt(translationSource, locale),
        '--model',
        options.model,
        '--effort',
        options.model.match(/-(low|medium|high)$/)?.[1] || 'medium',
        '--output-format',
        'json',
        '--json-schema',
        schemaPath,
        '--sandbox',
        '--disable-slash-commands',
        '--print-timeout',
        '10m',
      ])
      const result = JSON.parse(raw)

      if (result.status !== 'SUCCESS' || !result.structured_output) {
        throw new Error(
          `AGY failed for ${locale}: ${result.error || result.status || 'unknown error'}`,
        )
      }

      validateTranslation(translationSource, result.structured_output, locale)
      const translated = options.repairIdentical
        ? mergeCatalog(existingTarget, result.structured_output)
        : result.structured_output
      validateTranslation(source, translated, locale)

      if (options.write) {
        const temporaryTargetPath = `${targetPath}.tmp`
        await writeFile(temporaryTargetPath, `${JSON.stringify(translated, null, 2)}\n`)
        await rename(temporaryTargetPath, targetPath)

        state.locales ??= {}
        state.locales[locale] = {
          model: options.model,
          sourceHash,
          translatedAt: new Date().toISOString(),
        }
        state.sourceLocale = sourceLocale
        state.sourceHash = sourceHash
      }

      const usage = result.usage || {}
      console.log(
        `ok ${locale}: input=${usage.input_tokens ?? '?'} output=${usage.output_tokens ?? '?'} total=${usage.total_tokens ?? '?'}`,
      )
    }

    if (options.write) {
      await mkdir(messagesDirectory, { recursive: true })
      const temporaryStatePath = `${statePath}.tmp`
      await writeFile(temporaryStatePath, `${JSON.stringify(state, null, 2)}\n`)
      await rename(temporaryStatePath, statePath)
    }
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
