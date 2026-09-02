#!/usr/bin/env node

import 'dotenv/config'

import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { getPayload } from 'payload'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '../..')
const sourceLocale = 'en'
const supportedLocales = ['en', 'zh-CN', 'zh-TW', 'de', 'ja', 'ar', 'ru']
const defaultTargetLocales = supportedLocales.filter((locale) => locale !== sourceLocale)
const localeNames = {
  ar: 'Arabic',
  de: 'German',
  ja: 'Japanese',
  ru: 'Russian',
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
}
const protectedTerms = [
  'MODULIV',
  'DDP',
  'USD',
  'FSC',
  'SKU',
  'VAT',
  'Visa',
  'Mastercard',
  'American Express',
  'Stripe',
]
const defaultCollections = [
  'categories',
  'journal-posts',
  'materials',
  'media',
  'pages',
  'product-collections',
  'products',
  'spaces',
]
const defaultGlobals = ['announcement', 'footer', 'header', 'homepage', 'site-settings']

function parseArgs(argv) {
  const options = {
    apply: false,
    collections: defaultCollections,
    force: false,
    globals: defaultGlobals,
    ids: [],
    limit: 25,
    locales: defaultTargetLocales,
    maxChars: 12000,
    model: process.env.AGY_MODEL || 'gemini-3.7-flash-medium',
    output: path.join(projectRoot, 'translations/cms'),
    page: 1,
  }

  for (const argument of argv) {
    if (argument === '--') continue
    if (argument === '--apply') options.apply = true
    else if (argument === '--force') options.force = true
    else if (argument.startsWith('--collections=')) {
      options.collections = splitList(argument.slice('--collections='.length))
    } else if (argument.startsWith('--globals=')) {
      options.globals = splitList(argument.slice('--globals='.length))
    } else if (argument.startsWith('--ids=')) {
      options.ids = splitList(argument.slice('--ids='.length))
    } else if (argument.startsWith('--limit=')) {
      options.limit = positiveInteger(argument.slice('--limit='.length), '--limit')
    } else if (argument.startsWith('--locales=')) {
      options.locales = splitList(argument.slice('--locales='.length))
    } else if (argument.startsWith('--max-chars=')) {
      options.maxChars = positiveInteger(argument.slice('--max-chars='.length), '--max-chars')
    } else if (argument.startsWith('--model=')) {
      options.model = argument.slice('--model='.length)
    } else if (argument.startsWith('--output=')) {
      options.output = path.resolve(projectRoot, argument.slice('--output='.length))
    } else if (argument.startsWith('--page=')) {
      options.page = positiveInteger(argument.slice('--page='.length), '--page')
    } else if (argument === '--help' || argument === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }

  const invalidLocales = options.locales.filter(
    (locale) => !supportedLocales.includes(locale) || locale === sourceLocale,
  )
  if (invalidLocales.length) {
    throw new Error(`Unsupported target locale(s): ${invalidLocales.join(', ')}`)
  }
  if (options.ids.length && options.collections.length + options.globals.length !== 1) {
    throw new Error('--ids requires exactly one selected collection or global')
  }

  return options
}

function splitList(value) {
  if (value === 'none' || value === '') return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function positiveInteger(value, flag) {
  const number = Number.parseInt(value, 10)
  if (!Number.isInteger(number) || number < 1) throw new Error(`${flag} must be a positive integer`)
  return number
}

function printHelp() {
  console.log(`Generate reviewable Payload CMS translations with the local AGY CLI.

Usage:
  pnpm i18n:cms -- [options]
  pnpm i18n:cms:apply -- [options]

Generation options:
  --collections=list   Collection slugs (default: ${defaultCollections.join(',')})
  --globals=list       Global slugs (default: ${defaultGlobals.join(',')})
  --ids=list           Restrict one selected target to document IDs
  --locales=list       Target locales (default: ${defaultTargetLocales.join(',')})
  --limit=number       Documents per collection (default: 25)
  --page=number        Payload result page (default: 1)
  --max-chars=number   Approximate source characters per AGY batch (default: 12000)
  --model=name         AGY model (default: gemini-3.7-flash-medium)
  --output=path        Review artifact directory (default: translations/cms)
  --force              Replace existing non-applied review artifacts

Apply mode reads only artifacts whose status is "approved", verifies that the
English source is unchanged, and writes localized Payload versions as drafts.
It never publishes content.`)
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function escapePathSegment(segment) {
  return String(segment).replaceAll('~', '~0').replaceAll('/', '~1')
}

function pathLabel(segments) {
  return `/${segments.map(escapePathSegment).join('/')}`
}

function shouldTranslate(value) {
  const trimmed = value.trim()
  if (!trimmed || !/[\p{L}]/u.test(trimmed)) return false
  if (/^(?:https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return false
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(trimmed)) return false
  return true
}

function collectRichText(value, pathSegments, entries) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRichText(item, [...pathSegments, index], entries))
    return
  }
  if (!isRecord(value)) return

  for (const [key, child] of Object.entries(value)) {
    const childPath = [...pathSegments, key]
    if (key === 'text' && typeof child === 'string' && shouldTranslate(child)) {
      entries.push({ path: childPath, source: child })
    } else {
      collectRichText(child, childPath, entries)
    }
  }
}

function collectTextValue(value, pathSegments, entries) {
  if (typeof value === 'string' && shouldTranslate(value)) {
    entries.push({ path: pathSegments, source: value })
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collectTextValue(item, [...pathSegments, index], entries))
  }
}

function collectFields(fields, data, pathSegments = [], inheritedLocalized = false, entries = []) {
  if (!Array.isArray(fields) || !isRecord(data)) return entries

  for (const field of fields) {
    if (!isRecord(field)) continue

    if (field.type === 'tabs' && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) {
        if (!isRecord(tab) || !Array.isArray(tab.fields)) continue
        if (typeof tab.name === 'string') {
          collectFields(
            tab.fields,
            isRecord(data[tab.name]) ? data[tab.name] : {},
            [...pathSegments, tab.name],
            inheritedLocalized,
            entries,
          )
        } else {
          collectFields(tab.fields, data, pathSegments, inheritedLocalized, entries)
        }
      }
      continue
    }

    if ((field.type === 'row' || field.type === 'collapsible') && Array.isArray(field.fields)) {
      collectFields(field.fields, data, pathSegments, inheritedLocalized, entries)
      continue
    }

    if (typeof field.name !== 'string') continue
    const value = data[field.name]
    if (value === undefined || value === null) continue

    const fieldPath = [...pathSegments, field.name]
    const localized = inheritedLocalized || field.localized === true

    if ((field.type === 'text' || field.type === 'textarea') && localized) {
      collectTextValue(value, fieldPath, entries)
    } else if (field.type === 'richText' && localized) {
      collectRichText(value, fieldPath, entries)
    } else if (field.type === 'group' && Array.isArray(field.fields) && isRecord(value)) {
      collectFields(field.fields, value, fieldPath, localized, entries)
    } else if (field.type === 'array' && Array.isArray(field.fields) && Array.isArray(value)) {
      value.forEach((row, index) => {
        if (isRecord(row))
          collectFields(field.fields, row, [...fieldPath, index], localized, entries)
      })
    } else if (field.type === 'blocks' && Array.isArray(field.blocks) && Array.isArray(value)) {
      const blocksBySlug = new Map(
        field.blocks
          .filter((block) => isRecord(block) && typeof block.slug === 'string')
          .map((block) => [block.slug, block]),
      )
      value.forEach((row, index) => {
        if (!isRecord(row) || typeof row.blockType !== 'string') return
        const block = blocksBySlug.get(row.blockType)
        if (block && Array.isArray(block.fields)) {
          collectFields(block.fields, row, [...fieldPath, index], localized, entries)
        }
      })
    }
  }

  return entries
}

function getVersionDrafts(config) {
  return Boolean(config?.versions && config.versions.drafts)
}

function hashEntries(entries) {
  const normalized = entries.map((entry) => ({ path: entry.path, source: entry.source }))
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

function artifactRelativePath(target, locale) {
  const id = String(target.id).replaceAll(/[^A-Za-z0-9._-]/g, '_')
  return path.join(target.kind === 'global' ? 'globals' : target.slug, id, `${locale}.json`)
}

async function fileExists(filePath) {
  try {
    await readFile(filePath)
    return true
  } catch (error) {
    if (error && error.code === 'ENOENT') return false
    throw error
  }
}

function resolveAGYExecutable() {
  const candidates = [
    process.env.AGY_BIN,
    '/Users/alex/.local/bin/agy',
    path.join(process.env.HOME || '', '.local/bin/agy'),
    'agy',
  ].filter(Boolean)

  for (const candidate of candidates) {
    if (candidate === 'agy') return candidate
    try {
      const result = spawnSync(candidate, ['--version'], { encoding: 'utf8' })
      if (!result.error && result.status === 0) return candidate
    } catch {
      // Try the next candidate.
    }
  }
  return 'agy'
}

function buildPrompt(locale, sourceFile) {
  return `You are translating reviewed MODULIV CMS storefront content from English into ${localeNames[locale]} (${locale}).

The attached JSON is an object whose keys are opaque entry IDs and whose values are source strings.
Return ONLY one valid JSON object with exactly the same keys and translated string values.

Requirements:
- Use fluent, native ecommerce and editorial language for premium outdoor furniture.
- Preserve meaning, factual claims, measurements, quantities, dates, warranties, and legal qualifiers exactly.
- Preserve brand and commerce terms exactly where present: ${protectedTerms.join(', ')}.
- Preserve URLs, email addresses, placeholder tokens, model names, and material standards exactly.
- Do not add claims, explanations, Markdown, comments, or extra keys.
- For Arabic, use natural RTL prose while leaving protected Latin terms intact.
- For zh-CN and zh-TW, use the conventions of the specified market and do not mix scripts.

Translate every value in ${sourceFile}.`
}

function extractJSONObject(text) {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (fenced) return JSON.parse(fenced[1])
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1))
    throw new Error('AGY response did not contain a JSON object')
  }
}

function runAGY({ input, locale, model, workingDirectory }) {
  const sourceFile = path.join(workingDirectory, `${locale}.source.json`)
  return writeFile(sourceFile, `${JSON.stringify(input, null, 2)}\n`, 'utf8').then(() => {
    const executable = resolveAGYExecutable()
    const effort = model.match(/-(low|medium|high)$/)?.[1] || 'medium'
    const result = spawnSync(
      executable,
      [
        'run',
        '-q',
        buildPrompt(locale, sourceFile),
        '--model',
        model,
        '--effort',
        effort,
        '--output-format',
        'json',
        '--file',
        sourceFile,
      ],
      { cwd: projectRoot, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
    )

    if (result.error) throw result.error
    if (result.status !== 0) {
      throw new Error(`AGY exited with ${result.status}: ${result.stderr || result.stdout}`)
    }

    const envelope = JSON.parse(result.stdout)
    if (envelope.status && envelope.status !== 'SUCCESS') {
      throw new Error(envelope.error || `AGY returned ${envelope.status}`)
    }
    const translated = extractJSONObject(envelope.response || envelope.result || '')
    return { translated, usage: envelope.usage || null }
  })
}

function matches(pattern, text) {
  return text.match(pattern) || []
}

function validateTranslation(source, translation) {
  const issues = []
  if (typeof translation !== 'string' || !translation.trim()) return ['translation is empty']

  const placeholderPattern = /\{[^{}]+\}/g
  const urlPattern = /(?:https?:\/\/|mailto:|tel:)[^\s)]+/g
  const emailPattern = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g
  const numberPattern = /\d+(?:[.,]\d+)*/g

  for (const [label, pattern] of [
    ['placeholder', placeholderPattern],
    ['URL', urlPattern],
    ['email', emailPattern],
    ['number', numberPattern],
  ]) {
    const sourceValues = matches(pattern, source)
    const translatedValues = matches(pattern, translation)
    const missing = sourceValues.filter((value) => !translatedValues.includes(value))
    if (missing.length) issues.push(`${label}s missing: ${missing.join(', ')}`)
  }

  const missingTerms = protectedTerms.filter(
    (term) => source.includes(term) && !translation.includes(term),
  )
  if (missingTerms.length) issues.push(`protected terms missing: ${missingTerms.join(', ')}`)
  return issues
}

function chunkJobs(jobs, maxChars) {
  const entries = jobs.flatMap((job, jobIndex) =>
    job.entries.map((entry, entryIndex) => ({
      entry,
      entryIndex,
      job,
      jobIndex,
      key: `j${jobIndex}e${entryIndex}`,
    })),
  )
  const chunks = []
  let current = []
  let currentChars = 0

  for (const item of entries) {
    const itemChars = item.entry.source.length + item.key.length + 8
    if (current.length && currentChars + itemChars > maxChars) {
      chunks.push(current)
      current = []
      currentChars = 0
    }
    current.push(item)
    currentChars += itemChars
  }
  if (current.length) chunks.push(current)
  return chunks
}

async function loadGenerationJobs(payload, options) {
  const jobs = []
  const collectionsBySlug = new Map(
    payload.config.collections.map((config) => [config.slug, config]),
  )
  const globalsBySlug = new Map(payload.config.globals.map((config) => [config.slug, config]))

  for (const slug of options.collections) {
    const config = collectionsBySlug.get(slug)
    if (!config) throw new Error(`Unknown Payload collection: ${slug}`)
    if (!getVersionDrafts(config))
      throw new Error(`${slug} must enable version drafts before translation`)

    const where = options.ids.length ? { id: { in: options.ids } } : undefined
    const result = await payload.find({
      collection: slug,
      depth: 0,
      draft: true,
      fallbackLocale: false,
      limit: options.limit,
      locale: sourceLocale,
      overrideAccess: true,
      page: options.page,
      ...(where ? { where } : {}),
    })

    for (const doc of result.docs) {
      const entries = collectFields(config.fields, doc)
      if (!entries.length) continue
      const titleField = config.admin?.useAsTitle
      jobs.push({
        entries,
        source: doc,
        target: {
          id: doc.id,
          kind: 'collection',
          label:
            typeof titleField === 'string' && typeof doc[titleField] === 'string'
              ? doc[titleField]
              : `${slug} ${doc.id}`,
          slug,
        },
        updatedAt: doc.updatedAt || null,
      })
    }
  }

  for (const slug of options.globals) {
    const config = globalsBySlug.get(slug)
    if (!config) throw new Error(`Unknown Payload global: ${slug}`)
    if (!getVersionDrafts(config))
      throw new Error(`${slug} must enable version drafts before translation`)
    if (options.ids.length && !options.ids.includes(slug)) continue

    const doc = await payload.findGlobal({
      slug,
      depth: 0,
      draft: true,
      fallbackLocale: false,
      locale: sourceLocale,
      overrideAccess: true,
    })
    const entries = collectFields(config.fields, doc)
    if (!entries.length) continue
    jobs.push({
      entries,
      source: doc,
      target: { id: slug, kind: 'global', label: slug, slug },
      updatedAt: doc.updatedAt || null,
    })
  }

  return jobs
}

async function generateTranslations(payload, options) {
  const jobs = await loadGenerationJobs(payload, options)
  if (!jobs.length) {
    console.log('No localized source strings found for the selected targets.')
    return
  }

  await mkdir(options.output, { recursive: true })
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'moduliv-cms-i18n-'))
  let generated = 0
  let skipped = 0
  let totalTokens = 0

  try {
    for (const locale of options.locales) {
      const pendingJobs = []
      for (const job of jobs) {
        const artifactPath = path.join(options.output, artifactRelativePath(job.target, locale))
        if (await fileExists(artifactPath)) {
          const existing = JSON.parse(await readFile(artifactPath, 'utf8'))
          if (!options.force || existing.status === 'approved' || existing.status === 'applied') {
            skipped += 1
            continue
          }
        }
        pendingJobs.push(job)
      }
      if (!pendingJobs.length) continue

      const translatedByJob = new Map(pendingJobs.map((job) => [job, new Map()]))
      const chunks = chunkJobs(pendingJobs, options.maxChars)
      console.log(`${locale}: ${pendingJobs.length} target(s), ${chunks.length} AGY batch(es)`)

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
        const chunk = chunks[chunkIndex]
        const input = Object.fromEntries(chunk.map((item) => [item.key, item.entry.source]))
        const { translated, usage } = await runAGY({
          input,
          locale,
          model: options.model,
          workingDirectory: temporaryDirectory,
        })
        const sourceKeys = Object.keys(input).sort()
        const translatedKeys = Object.keys(translated).sort()
        if (JSON.stringify(sourceKeys) !== JSON.stringify(translatedKeys)) {
          throw new Error(`${locale} batch ${chunkIndex + 1}: AGY changed the entry key set`)
        }

        for (const item of chunk) {
          const translation = translated[item.key]
          const issues = validateTranslation(item.entry.source, translation)
          if (issues.length) {
            throw new Error(
              `${locale} ${item.job.target.slug}/${item.job.target.id} ${pathLabel(item.entry.path)}: ${issues.join('; ')}`,
            )
          }
          translatedByJob.get(item.job).set(item.entryIndex, translation)
        }

        totalTokens += usage?.total_tokens || 0
        console.log(
          `  batch ${chunkIndex + 1}/${chunks.length}: ${Object.keys(input).length} strings, ${usage?.total_tokens || 'unknown'} tokens`,
        )
      }

      for (const job of pendingJobs) {
        const translations = translatedByJob.get(job)
        const legalReviewRequired =
          job.target.slug === 'materials' ||
          job.entries.some((entry) =>
            /\b(?:certif(?:y|ied|ication)|compliance|EUDR|FLEGT|guarantee|legal|safety|SVLK|V-Legal|warranty)\b/i.test(
              entry.source,
            ),
          )
        const artifact = {
          schemaVersion: 1,
          status: 'pending',
          sourceLocale,
          targetLocale: locale,
          target: job.target,
          sourceHash: hashEntries(job.entries),
          sourceUpdatedAt: job.updatedAt,
          review: {
            instructions:
              'Review every translation, edit translation values as needed, then change status to "approved". Applying always creates a Payload draft.',
            legalReviewRequired,
          },
          entries: job.entries.map((entry, index) => ({
            path: entry.path,
            source: entry.source,
            translation: translations.get(index),
          })),
        }
        const artifactPath = path.join(options.output, artifactRelativePath(job.target, locale))
        await mkdir(path.dirname(artifactPath), { recursive: true })
        await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
        generated += 1
      }
    }
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }

  await writeManifest(options.output)
  console.log(
    `Generated ${generated} review artifact(s); skipped ${skipped}; AGY tokens ${totalTokens}.`,
  )
  console.log(`Review directory: ${path.relative(projectRoot, options.output)}`)
}

async function findJSONFiles(directory) {
  const files = []
  if (!(await fileExists(directory))) return files
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await findJSONFiles(entryPath)))
    else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') {
      files.push(entryPath)
    }
  }
  return files
}

async function writeManifest(outputDirectory) {
  const files = await findJSONFiles(outputDirectory)
  const records = []
  for (const filePath of files.sort()) {
    const artifact = JSON.parse(await readFile(filePath, 'utf8'))
    records.push({
      file: path.relative(outputDirectory, filePath),
      label: artifact.target?.label,
      locale: artifact.targetLocale,
      status: artifact.status,
      target: `${artifact.target?.kind}:${artifact.target?.slug}:${artifact.target?.id}`,
    })
  }
  const manifest = { schemaVersion: 1, artifacts: records }
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(
    path.join(outputDirectory, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  )
}

function setAtPath(target, pathSegments, value) {
  let current = target
  for (let index = 0; index < pathSegments.length - 1; index += 1) {
    const segment = pathSegments[index]
    if (current[segment] === undefined || current[segment] === null) {
      current[segment] = typeof pathSegments[index + 1] === 'number' ? [] : {}
    }
    current = current[segment]
  }
  current[pathSegments[pathSegments.length - 1]] = value
}

function buildDraftPatch(source, entries) {
  const patch = {}
  const topLevelFields = new Set(entries.map((entry) => entry.path[0]))
  for (const field of topLevelFields) {
    patch[field] = structuredClone(source[field])
  }
  for (const entry of entries) setAtPath(patch, entry.path, entry.translation)
  return patch
}

async function applyApprovedArtifacts(payload, options) {
  const files = await findJSONFiles(options.output)
  const selectedCollections = new Set(options.collections)
  const selectedGlobals = new Set(options.globals)
  const selectedLocales = new Set(options.locales)
  const collectionsBySlug = new Map(
    payload.config.collections.map((config) => [config.slug, config]),
  )
  const globalsBySlug = new Map(payload.config.globals.map((config) => [config.slug, config]))
  let applied = 0
  let ignored = 0

  for (const filePath of files.sort()) {
    const artifact = JSON.parse(await readFile(filePath, 'utf8'))
    if (artifact.status !== 'approved') {
      ignored += 1
      continue
    }
    if (!selectedLocales.has(artifact.targetLocale)) continue
    if (
      !supportedLocales.includes(artifact.targetLocale) ||
      artifact.targetLocale === sourceLocale
    ) {
      throw new Error(`${filePath}: invalid target locale`)
    }

    const target = artifact.target
    const isCollection = target?.kind === 'collection'
    if (isCollection && !selectedCollections.has(target.slug)) continue
    if (!isCollection && !selectedGlobals.has(target?.slug)) continue
    if (options.ids.length && !options.ids.includes(String(target.id))) continue

    const config = isCollection
      ? collectionsBySlug.get(target.slug)
      : globalsBySlug.get(target.slug)
    if (!config || !getVersionDrafts(config)) {
      throw new Error(`${filePath}: target is missing or does not support drafts`)
    }

    const source = isCollection
      ? await payload.findByID({
          collection: target.slug,
          id: target.id,
          depth: 0,
          draft: true,
          fallbackLocale: false,
          locale: sourceLocale,
          overrideAccess: true,
        })
      : await payload.findGlobal({
          slug: target.slug,
          depth: 0,
          draft: true,
          fallbackLocale: false,
          locale: sourceLocale,
          overrideAccess: true,
        })
    const currentEntries = collectFields(config.fields, source)
    if (hashEntries(currentEntries) !== artifact.sourceHash) {
      throw new Error(`${filePath}: English source changed; regenerate and review this artifact`)
    }
    if (!Array.isArray(artifact.entries) || artifact.entries.length !== currentEntries.length) {
      throw new Error(`${filePath}: entry structure does not match the current source`)
    }

    for (let index = 0; index < artifact.entries.length; index += 1) {
      const entry = artifact.entries[index]
      const current = currentEntries[index]
      if (
        JSON.stringify(entry.path) !== JSON.stringify(current.path) ||
        entry.source !== current.source
      ) {
        throw new Error(`${filePath}: source entry ${index + 1} changed`)
      }
      const issues = validateTranslation(entry.source, entry.translation)
      if (issues.length) throw new Error(`${filePath}: entry ${index + 1}: ${issues.join('; ')}`)
    }

    const patch = { ...buildDraftPatch(source, artifact.entries), _status: 'draft' }
    if (isCollection) {
      await payload.update({
        collection: target.slug,
        id: target.id,
        data: patch,
        draft: true,
        fallbackLocale: false,
        locale: artifact.targetLocale,
        overrideAccess: true,
      })
    } else {
      await payload.updateGlobal({
        slug: target.slug,
        data: patch,
        draft: true,
        fallbackLocale: false,
        locale: artifact.targetLocale,
        overrideAccess: true,
      })
    }

    artifact.status = 'applied'
    artifact.appliedAsDraft = true
    await writeFile(filePath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
    applied += 1
    console.log(`drafted ${artifact.targetLocale} ${target.kind}:${target.slug}:${target.id}`)
  }

  await writeManifest(options.output)
  console.log(`Applied ${applied} approved artifact(s) as drafts; ignored ${ignored} non-approved.`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const { default: configPromise } = await import('@payload-config')
  const payload = await getPayload({ config: configPromise })
  if (options.apply) await applyApprovedArtifacts(payload, options)
  else await generateTranslations(payload, options)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
