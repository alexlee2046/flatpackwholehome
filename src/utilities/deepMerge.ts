/**
 * Narrowing check for plain objects. Declared as a type predicate so callers
 * (and deepMerge below) can index the value afterwards — without it the file
 * needed a @ts-nocheck, which switched off type checking for everything here.
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item) && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 */
export function deepMerge<T, R>(target: T, source: R): T {
  const output = { ...target } as Record<string, unknown>

  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      const sourceValue = source[key]
      output[key] =
        isObject(sourceValue) && key in target ? deepMerge(target[key], sourceValue) : sourceValue
    }
  }

  return output as T
}
