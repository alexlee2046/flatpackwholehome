import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Trigger on-demand cache revalidation for a given cache tag.
 * Safe to call from Payload hooks (silently ignores non-request / non-server contexts).
 */
export function revalidateStorefrontTag(tag: string): void {
  try {
    revalidateTag(tag, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    // Non-fatal if called outside Next.js request lifecycle
  }
}
