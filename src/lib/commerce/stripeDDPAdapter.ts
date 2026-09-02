import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import { commitTransaction, initTransaction, killTransaction, type PayloadRequest } from 'payload'
import { createHash } from 'node:crypto'
import Stripe from 'stripe'

import { defaultLocale, locales, type AppLocale } from '@/i18n/routing'
import { readStripeServerConfig } from './stripeConfig'
import { getShippingDestination, normalizeCheckoutAddress } from './checkoutValidation'
import { calculateDDPQuote, MAX_ITEM_QUANTITY, type ODSaiDestinationCode } from './ddp'

const MAX_PAYMENT_AMOUNT_IN_USD = 99_999_999
const DDP_PRICING_VERSION = 'provisional-cbm-v1'

type CheckoutCartItem = {
  product?: unknown
  quantity?: unknown
  variant?: unknown
}

type CheckoutCart = {
  id?: unknown
  items?: CheckoutCartItem[] | null
  purchasedAt?: unknown
  subtotal?: unknown
}

type CanonicalItem = { product: number; quantity: number; variant?: number }
type StripeClient = Pick<Stripe, 'customers' | 'paymentIntents' | 'refunds'>
type TransactionDatabase = {
  execute: (statement: unknown) => Promise<{ rows: Record<string, unknown>[] }>
}

export type StripeDDPDependencies = {
  now?: () => Date
  stripe?: StripeClient
}

class CheckoutItemUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CheckoutItemUnavailableError'
  }
}

class RefundedPaymentError extends Error {
  constructor() {
    super('The order could not be fulfilled and the payment was refunded.')
    this.name = 'RefundedPaymentError'
  }
}

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return relationshipID((value as { id?: unknown }).id)
  }
  return undefined
}

function normalizeCheckoutLocale(value: unknown): AppLocale {
  if (value === undefined || value === null || value === '') return defaultLocale
  if (typeof value === 'string' && locales.includes(value as AppLocale)) return value as AppLocale
  throw new Error('The checkout locale is invalid.')
}

function canonicalItemsFingerprint(items: CanonicalItem[]): string {
  const quantities = new Map<string, number>()
  for (const item of items) {
    const key = `${item.product}:${item.variant ?? ''}`
    quantities.set(key, (quantities.get(key) ?? 0) + item.quantity)
  }

  return JSON.stringify([...quantities.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function canonicalizeItems(items: CheckoutCartItem[] | null | undefined): CanonicalItem[] {
  if (!items?.length) throw new Error('Your cart is empty.')

  return items.map((item) => {
    const product = relationshipID(item.product)
    const variant = relationshipID(item.variant)
    const quantity = item.quantity

    if (!product) throw new Error('A cart product is missing.')
    if (item.variant !== undefined && item.variant !== null && !variant) {
      throw new Error('A cart variant is invalid.')
    }
    if (
      !Number.isInteger(quantity) ||
      (quantity as number) < 1 ||
      (quantity as number) > MAX_ITEM_QUANTITY
    ) {
      throw new Error(`Item quantities must be between 1 and ${MAX_ITEM_QUANTITY}.`)
    }

    return {
      product,
      quantity: quantity as number,
      ...(variant ? { variant } : {}),
    }
  })
}

async function resolveSellableItems({
  checkInventory,
  items,
  req,
}: {
  checkInventory: boolean
  items: CanonicalItem[]
  req: PayloadRequest
}) {
  let packedCbm = 0
  let subtotalInUSD = 0
  const requestedInventory = new Map<string, { available: number; quantity: number }>()

  for (const item of items) {
    const product = await req.payload.findByID({
      collection: 'products',
      depth: 0,
      id: item.product,
      overrideAccess: true,
      req,
      select: {
        _status: true,
        enableVariants: true,
        inventory: true,
        packedVolumeCbm: true,
        priceInUSD: true,
        priceInUSDEnabled: true,
      },
    })

    if (!product || product._status !== 'published') {
      throw new CheckoutItemUnavailableError('A cart product is no longer available.')
    }
    if (product.priceInUSDEnabled !== true) {
      throw new CheckoutItemUnavailableError('A cart product is not enabled for USD checkout.')
    }
    if (!Number.isFinite(product.packedVolumeCbm) || (product.packedVolumeCbm ?? 0) <= 0) {
      throw new CheckoutItemUnavailableError('A cart product is missing delivery dimensions.')
    }

    let unitPrice = product.priceInUSD
    let available = product.inventory

    if (product.enableVariants) {
      if (!item.variant) {
        throw new CheckoutItemUnavailableError('Choose a teak expression before checkout.')
      }

      const variant = await req.payload.findByID({
        collection: 'variants',
        depth: 0,
        id: item.variant,
        overrideAccess: true,
        req,
        select: {
          _status: true,
          inventory: true,
          priceInUSD: true,
          priceInUSDEnabled: true,
          product: true,
        },
      })
      const variantProductID = relationshipID(variant?.product)

      if (!variant || variant._status !== 'published' || variantProductID !== item.product) {
        throw new CheckoutItemUnavailableError('A selected teak expression is no longer available.')
      }
      if (variant.priceInUSDEnabled !== true) {
        throw new CheckoutItemUnavailableError(
          'A selected teak expression is not enabled for USD checkout.',
        )
      }

      unitPrice = variant.priceInUSD
      available = variant.inventory
    } else if (item.variant) {
      throw new CheckoutItemUnavailableError('This product does not accept a variant selection.')
    }

    if (typeof unitPrice !== 'number' || !Number.isInteger(unitPrice) || unitPrice <= 0) {
      throw new CheckoutItemUnavailableError('A cart item is missing a valid USD price.')
    }
    if (checkInventory) {
      if (typeof available !== 'number' || !Number.isInteger(available)) {
        throw new CheckoutItemUnavailableError('A cart item has invalid inventory.')
      }
      const inventoryKey = item.variant ? `variant:${item.variant}` : `product:${item.product}`
      const current = requestedInventory.get(inventoryKey)
      requestedInventory.set(inventoryKey, {
        available,
        quantity: (current?.quantity ?? 0) + item.quantity,
      })
    }

    subtotalInUSD += unitPrice * item.quantity
    packedCbm += (product.packedVolumeCbm as number) * item.quantity
  }

  if ([...requestedInventory.values()].some((stock) => stock.quantity > stock.available)) {
    throw new CheckoutItemUnavailableError(
      'A cart item is not available in the requested quantity.',
    )
  }

  return { packedCbm, subtotalInUSD }
}

export async function priceCart({
  cart,
  countryCode,
  req,
}: {
  cart: CheckoutCart
  countryCode: ODSaiDestinationCode
  req: PayloadRequest
}) {
  const items = canonicalizeItems(cart.items)
  const { packedCbm, subtotalInUSD } = await resolveSellableItems({
    checkInventory: true,
    items,
    req,
  })

  if (cart.subtotal !== subtotalInUSD) {
    throw new Error('Your cart price changed. Refresh the cart before paying.')
  }

  return {
    items,
    quote: calculateDDPQuote({ countryCode, packedCbm, subtotalInUSD }),
    subtotalInUSD,
  }
}

async function findTransaction(req: PayloadRequest, paymentIntentID: string) {
  const result = await req.payload.find({
    collection: 'transactions',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: { 'stripe.paymentIntentID': { equals: paymentIntentID } },
  })

  return result.docs[0]
}

function verifyTransactionCustomer(
  transaction: Awaited<ReturnType<typeof findTransaction>>,
  req: PayloadRequest,
  providedEmail: unknown,
  trustedServerRequest = false,
) {
  if (!transaction) throw new Error('No transaction was found for this payment.')

  const transactionCustomerID = relationshipID(transaction.customer)
  const transactionEmail = transaction.customerEmail?.trim().toLowerCase()

  if (trustedServerRequest) {
    if (!transactionCustomerID && !transactionEmail) {
      throw new Error('The payment transaction has no customer identity.')
    }
    return transactionCustomerID
  }

  if (transactionCustomerID) {
    if (relationshipID(req.user?.id) !== transactionCustomerID) {
      throw new Error('This payment belongs to another customer.')
    }
  } else {
    const email = typeof providedEmail === 'string' ? providedEmail.trim().toLowerCase() : ''
    if (!transactionEmail || transactionEmail !== email) {
      throw new Error('Payment email verification failed.')
    }
  }

  return transactionCustomerID
}

async function getTransactionDatabase(req: PayloadRequest): Promise<TransactionDatabase> {
  const transactionID = await req.transactionID
  if (!transactionID) throw new Error('A database transaction is required to confirm an order.')

  const adapter = req.payload.db as unknown as PostgresAdapter
  const database = adapter.sessions[String(transactionID)]?.db
  if (!database) throw new Error('The order transaction session is unavailable.')

  return database as unknown as TransactionDatabase
}

async function lockOrderRows(database: TransactionDatabase, transactionID: number, cartID: number) {
  const transaction = await database.execute(
    sql`SELECT "id" FROM "transactions" WHERE "id" = ${transactionID} FOR UPDATE`,
  )
  if (transaction.rows.length !== 1) throw new Error('The payment transaction no longer exists.')

  const cart = await database.execute(
    sql`SELECT "id" FROM "carts" WHERE "id" = ${cartID} FOR UPDATE`,
  )
  if (cart.rows.length !== 1) throw new Error('The payment cart no longer exists.')
}

async function lockInventoryRows(database: TransactionDatabase, items: CanonicalItem[]) {
  const productIDs = [...new Set(items.map((item) => item.product))].sort((a, b) => a - b)
  const variantIDs = [
    ...new Set(items.flatMap((item) => (item.variant ? [item.variant] : []))),
  ].sort((a, b) => a - b)

  for (const id of productIDs) {
    const result = await database.execute(
      sql`SELECT "id" FROM "products" WHERE "id" = ${id} FOR UPDATE`,
    )
    if (result.rows.length !== 1) {
      throw new CheckoutItemUnavailableError('A cart product is no longer available.')
    }
  }

  for (const id of variantIDs) {
    const result = await database.execute(
      sql`SELECT "id" FROM "variants" WHERE "id" = ${id} FOR UPDATE`,
    )
    if (result.rows.length !== 1) {
      throw new CheckoutItemUnavailableError('A selected teak expression is no longer available.')
    }
  }
}

async function decrementInventory(database: TransactionDatabase, items: CanonicalItem[]) {
  const quantities = new Map<string, { id: number; quantity: number; variant: boolean }>()

  for (const item of items) {
    const variant = Boolean(item.variant)
    const id = item.variant ?? item.product
    const key = `${variant ? 'variant' : 'product'}:${id}`
    const current = quantities.get(key)
    quantities.set(key, {
      id,
      quantity: (current?.quantity ?? 0) + item.quantity,
      variant,
    })
  }

  for (const stock of [...quantities.values()].sort((a, b) => {
    if (a.variant !== b.variant) return a.variant ? 1 : -1
    return a.id - b.id
  })) {
    const result = stock.variant
      ? await database.execute(sql`
          UPDATE "variants"
          SET "inventory" = "inventory" - ${stock.quantity}, "updated_at" = now()
          WHERE "id" = ${stock.id}
          RETURNING "id"
        `)
      : await database.execute(sql`
          UPDATE "products"
          SET "inventory" = "inventory" - ${stock.quantity}, "updated_at" = now()
          WHERE "id" = ${stock.id}
          RETURNING "id"
        `)

    if (result.rows.length !== 1) {
      throw new Error('A locked inventory row disappeared during confirmation.')
    }
  }
}

type ConfirmedOrder = { accessToken?: null | string; id: number | string }

function confirmationResponse(order: ConfirmedOrder) {
  // Payload 3.88's generic confirmation handler decrements inventory whenever an adapter
  // returns transactionID. This adapter owns the atomic decrement, so intentionally omit it.
  return {
    ...(order.accessToken ? { accessToken: order.accessToken } : {}),
    message: 'Order confirmed successfully',
    orderID: order.id,
  } as unknown as Awaited<ReturnType<PaymentAdapter['confirmOrder']>>
}

async function existingOrderResponse(
  req: PayloadRequest,
  transaction: NonNullable<Awaited<ReturnType<typeof findTransaction>>>,
) {
  const orderID = relationshipID(transaction.order)
  if (!orderID) return null

  const order = await req.payload.findByID({
    collection: 'orders',
    depth: 0,
    id: orderID,
    overrideAccess: true,
    req,
    select: { accessToken: true },
  })

  if (!order) throw new Error('The confirmed order could not be found.')
  return confirmationResponse(order)
}

/** Stripe adapter that recomputes product and DDP amounts server-side before charging. */
export function stripeDDPAdapter(
  props: Parameters<typeof stripeAdapter>[0],
  dependencies: StripeDDPDependencies = {},
): PaymentAdapter {
  let stripeClient = dependencies.stripe
  const now = dependencies.now ?? (() => new Date())
  const getStripe = (): StripeClient => {
    const status = readStripeServerConfig({
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: props.publishableKey,
      STRIPE_SECRET_KEY: props.secretKey,
      STRIPE_WEBHOOKS_SIGNING_SECRET: props.webhookSecret,
    }).status
    if (status !== 'configured') throw new Error('Stripe payments are not configured.')

    stripeClient ??= new Stripe(props.secretKey)
    return stripeClient
  }

  const inspectRefunds = async (stripe: StripeClient, paymentIntentID: string) => {
    const refunds = await stripe.refunds.list({ limit: 100, payment_intent: paymentIntentID })
    if (refunds.has_more) {
      throw new Error('Payment refund history requires administrator reconciliation.')
    }

    return {
      hasPending: refunds.data.some(
        (refund) => refund.status === 'pending' || refund.status === 'requires_action',
      ),
      succeededAmount: refunds.data
        .filter((refund) => refund.status === 'succeeded')
        .reduce((total, refund) => total + refund.amount, 0),
    }
  }

  const settleRefund = async ({
    paymentIntentID,
    req,
    transactionID,
  }: {
    paymentIntentID: string
    req: PayloadRequest
    transactionID: number
  }) => {
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)
    const refundState = await inspectRefunds(stripe, paymentIntentID)
    if (refundState.hasPending) {
      throw new Error('Payment refund is still processing.')
    }

    if (refundState.succeededAmount < paymentIntent.amount) {
      const refund = await stripe.refunds.create(
        { payment_intent: paymentIntentID, reason: 'requested_by_customer' },
        { idempotencyKey: `odsai-unavailable-${paymentIntentID}` },
      )
      if (refund.status && refund.status !== 'succeeded') {
        throw new Error('Payment refund is still processing.')
      }
    }

    await req.payload.update({
      collection: 'transactions',
      data: { status: 'refunded' },
      id: transactionID,
      overrideAccess: true,
      req,
    })
  }

  const refundPayment = async (args: Parameters<typeof settleRefund>[0]): Promise<never> => {
    await settleRefund(args)
    throw new RefundedPaymentError()
  }

  const initiatePayment: PaymentAdapter['initiatePayment'] = async ({
    data,
    req,
    transactionsSlug,
  }) => {
    if (transactionsSlug !== 'transactions') {
      throw new Error('ODSai payment collection configuration is invalid.')
    }

    const stripe = getStripe()
    const customerEmail = data.customerEmail?.trim().toLowerCase()
    const currency = data.currency?.toUpperCase()
    const billingAddress = normalizeCheckoutAddress(data.billingAddress, 'billing')
    const shippingAddress = normalizeCheckoutAddress(data.shippingAddress, 'shipping')
    const countryCode = getShippingDestination(shippingAddress)
    const checkoutLocale = normalizeCheckoutLocale(
      (req.data as Record<string, unknown> | undefined)?.locale,
    )
    const cartID = relationshipID(data.cart.id)

    if (!customerEmail || !customerEmail.includes('@')) {
      throw new Error('A valid customer email is required.')
    }
    if (currency !== 'USD') throw new Error('ODSai checkout currently supports USD only.')
    if (!cartID) throw new Error('A valid cart is required.')

    const failedTransactions = await req.payload.find({
      collection: 'transactions',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      req,
      sort: 'createdAt',
      where: {
        and: [{ cart: { equals: cartID } }, { status: { equals: 'failed' } }],
      },
    })
    for (const failedTransaction of failedTransactions.docs) {
      verifyTransactionCustomer(failedTransaction, req, customerEmail)
      const failedTransactionID = relationshipID(failedTransaction.id)
      const failedPaymentIntentID = failedTransaction.stripe?.paymentIntentID
      if (!failedTransactionID || !failedPaymentIntentID) {
        throw new Error('A previous payment refund requires administrator reconciliation.')
      }
      await settleRefund({
        paymentIntentID: failedPaymentIntentID,
        req,
        transactionID: failedTransactionID,
      })
    }
    if (failedTransactions.docs.length) throw new RefundedPaymentError()

    const freshCart = (await req.payload.findByID({
      collection: 'carts',
      depth: 0,
      id: cartID,
      overrideAccess: true,
      req,
      select: { id: true, items: true, purchasedAt: true, subtotal: true },
    })) as CheckoutCart
    if (freshCart.purchasedAt) throw new Error('This cart has already been purchased.')

    const { items, quote } = await priceCart({ cart: freshCart, countryCode, req })

    if (quote.landedTotalInUSD > MAX_PAYMENT_AMOUNT_IN_USD) {
      throw new Error('This order requires a trade checkout. Please contact ODSai.')
    }

    let customer = (await stripe.customers.list({ email: customerEmail, limit: 1 })).data[0]
    if (!customer) customer = await stripe.customers.create({ email: customerEmail })

    const idempotencyKey = `odsai-${createHash('sha256')
      .update(
        JSON.stringify({
          cartID,
          checkoutLocale,
          customerEmail,
          items,
          landedTotalInUSD: quote.landedTotalInUSD,
          shippingAddress,
        }),
      )
      .digest('hex')}`
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: quote.landedTotalInUSD,
        automatic_payment_methods: { enabled: true },
        currency: 'usd',
        customer: customer.id,
        description: 'ODSai made-to-order furniture',
        metadata: {
          cartID: String(cartID),
          checkoutLocale,
          ddpPricingVersion: DDP_PRICING_VERSION,
          shippingZone: quote.zone,
        },
        receipt_email: customerEmail,
      },
      { idempotencyKey },
    )

    if (
      !['requires_action', 'requires_confirmation', 'requires_payment_method'].includes(
        paymentIntent.status,
      )
    ) {
      throw new Error('This cart already has a payment in progress or completed.')
    }

    const existingTransaction = await findTransaction(req, paymentIntent.id)
    if (existingTransaction) {
      if (existingTransaction.status !== 'pending') {
        throw new Error('This cart payment has already been processed.')
      }
    } else {
      try {
        await req.payload.create({
          collection: 'transactions',
          data: {
            ...(req.user ? { customer: req.user.id } : { customerEmail }),
            amount: paymentIntent.amount,
            billingAddress,
            cart: cartID,
            checkoutLocale,
            currency: 'USD',
            ddpPricingVersion: DDP_PRICING_VERSION,
            deliveryEstimateMaxDays: quote.deliveryDays.max,
            deliveryEstimateMinDays: quote.deliveryDays.min,
            freightInUSD: quote.freightInUSD,
            importChargesInUSD: quote.importChargesInUSD,
            items,
            paymentMethod: 'stripe',
            shippingAddress,
            shippingAmountInUSD: quote.shippingAndImportInUSD,
            shippingZone: quote.zone,
            status: 'pending',
            stripe: {
              customerID: customer.id,
              paymentIntentID: paymentIntent.id,
            },
          },
          req,
        })
      } catch (transactionError) {
        const racedTransaction = await findTransaction(req, paymentIntent.id)
        if (!racedTransaction) throw transactionError
      }
    }

    return {
      clientSecret: paymentIntent.client_secret || '',
      message: 'Payment initiated successfully',
      paymentIntentID: paymentIntent.id,
    }
  }

  const confirmPayment = async ({
    data,
    req,
    trustedServerRequest = false,
  }: {
    data: Parameters<PaymentAdapter['confirmOrder']>[0]['data']
    req: PayloadRequest
    trustedServerRequest?: boolean
  }): Promise<Awaited<ReturnType<PaymentAdapter['confirmOrder']>>> => {
    const paymentIntentID = data.paymentIntentID
    if (typeof paymentIntentID !== 'string' || !paymentIntentID) {
      throw new Error('Payment intent ID is required.')
    }

    const stripe = getStripe()
    const initialTransaction = await findTransaction(req, paymentIntentID)
    if (!initialTransaction) throw new Error('No transaction was found for this payment.')
    verifyTransactionCustomer(
      initialTransaction,
      req,
      data.customerEmail,
      trustedServerRequest,
    )

    const initialTransactionID = relationshipID(initialTransaction.id)
    const initialCartID = relationshipID(initialTransaction.cart)
    const requestCartID = relationshipID((data as typeof data & { cartID?: unknown }).cartID)
    if (!initialTransactionID || !initialCartID) {
      throw new Error('The payment transaction snapshot is invalid.')
    }
    if (
      !trustedServerRequest &&
      ((requestCartID && requestCartID !== initialCartID) ||
        (!req.user && requestCartID !== initialCartID))
    ) {
      throw new Error('The requested cart does not match this payment.')
    }

    const confirmed = await existingOrderResponse(req, initialTransaction)
    if (confirmed) return confirmed

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)
    if (paymentIntent.status !== 'succeeded') throw new Error('Payment is not complete.')
    if (initialTransaction.status === 'refunded') throw new RefundedPaymentError()
    if (initialTransaction.status === 'failed') {
      return refundPayment({
        paymentIntentID,
        req,
        transactionID: initialTransactionID,
      })
    }
    if (initialTransaction.status !== 'pending') {
      throw new Error('This payment cannot be confirmed.')
    }

    const startedTransaction = await initTransaction(req)
    if (!startedTransaction) {
      throw new Error('Order confirmation requires an independent database transaction.')
    }

    let settled = false
    try {
      const database = await getTransactionDatabase(req)
      await lockOrderRows(database, initialTransactionID, initialCartID)

      const transaction = await findTransaction(req, paymentIntentID)
      if (
        !transaction ||
        relationshipID(transaction.id) !== initialTransactionID ||
        relationshipID(transaction.cart) !== initialCartID
      ) {
        throw new Error('The payment transaction changed during confirmation.')
      }
      const transactionCustomerID = verifyTransactionCustomer(
        transaction,
        req,
        data.customerEmail,
        trustedServerRequest,
      )
      const existing = await existingOrderResponse(req, transaction)
      if (existing) {
        await commitTransaction(req)
        settled = true
        return existing
      }
      if (transaction.status === 'refunded') {
        await commitTransaction(req)
        settled = true
        throw new RefundedPaymentError()
      }
      if (transaction.status === 'failed') {
        await commitTransaction(req)
        settled = true
        return refundPayment({ paymentIntentID, req, transactionID: initialTransactionID })
      }
      if (transaction.status !== 'pending') throw new Error('This payment cannot be confirmed.')

      const markRefundRequired = async (): Promise<never> => {
        await req.payload.update({
          collection: 'transactions',
          data: { status: 'failed' },
          id: transaction.id,
          overrideAccess: true,
          req,
        })
        await commitTransaction(req)
        settled = true
        return refundPayment({ paymentIntentID, req, transactionID: initialTransactionID })
      }
      const markRefunded = async (): Promise<never> => {
        await req.payload.update({
          collection: 'transactions',
          data: { status: 'refunded' },
          id: transaction.id,
          overrideAccess: true,
          req,
        })
        await commitTransaction(req)
        settled = true
        throw new RefundedPaymentError()
      }

      const refundState = await inspectRefunds(stripe, paymentIntentID)
      if (refundState.hasPending) {
        throw new Error('Payment refund is still processing.')
      }
      if (refundState.succeededAmount >= paymentIntent.amount) await markRefunded()
      if (refundState.succeededAmount > 0) await markRefundRequired()

      if (paymentIntent.amount !== transaction.amount || paymentIntent.currency !== 'usd') {
        await markRefundRequired()
      }

      const transactionSnapshot = await (async (): Promise<{
        checkoutLocale: AppLocale
        items: CanonicalItem[]
        shippingAddress: ReturnType<typeof normalizeCheckoutAddress>
      }> => {
        try {
          const checkoutLocale = normalizeCheckoutLocale(transaction.checkoutLocale)
          if (
            paymentIntent.metadata.cartID !== String(initialCartID) ||
            (paymentIntent.metadata.checkoutLocale &&
              paymentIntent.metadata.checkoutLocale !== checkoutLocale) ||
            paymentIntent.metadata.ddpPricingVersion !== transaction.ddpPricingVersion ||
            paymentIntent.metadata.shippingZone !== transaction.shippingZone
          ) {
            throw new Error('Payment delivery verification failed.')
          }

          normalizeCheckoutAddress(transaction.billingAddress, 'billing')
          return {
            checkoutLocale,
            items: canonicalizeItems(transaction.items as CheckoutCartItem[] | null | undefined),
            shippingAddress: normalizeCheckoutAddress(transaction.shippingAddress, 'shipping'),
          }
        } catch {
          return markRefundRequired()
        }
      })()
      const { checkoutLocale, items, shippingAddress } = transactionSnapshot

      const cart = await req.payload.findByID({
        collection: 'carts',
        depth: 0,
        id: initialCartID,
        overrideAccess: true,
        req,
        select: { items: true, purchasedAt: true, status: true, subtotal: true },
      })

      let currentCartItems: CanonicalItem[] = []
      try {
        currentCartItems = canonicalizeItems(cart.items as CheckoutCartItem[] | null | undefined)
      } catch {
        await markRefundRequired()
      }

      const shippingAmount = transaction.shippingAmountInUSD
      const snapshotSubtotal =
        typeof transaction.amount === 'number' && typeof shippingAmount === 'number'
          ? transaction.amount - shippingAmount
          : Number.NaN
      if (
        cart.purchasedAt ||
        cart.status === 'purchased' ||
        !Number.isInteger(snapshotSubtotal) ||
        cart.subtotal !== snapshotSubtotal ||
        canonicalItemsFingerprint(currentCartItems) !== canonicalItemsFingerprint(items)
      ) {
        await markRefundRequired()
      }

      try {
        await lockInventoryRows(database, items)
        const currentPricing = await resolveSellableItems({ checkInventory: true, items, req })
        const currentQuote = calculateDDPQuote({
          countryCode: getShippingDestination(shippingAddress),
          packedCbm: currentPricing.packedCbm,
          subtotalInUSD: currentPricing.subtotalInUSD,
        })

        if (
          currentPricing.subtotalInUSD !== snapshotSubtotal ||
          currentQuote.landedTotalInUSD !== transaction.amount ||
          currentQuote.shippingAndImportInUSD !== transaction.shippingAmountInUSD ||
          currentQuote.freightInUSD !== transaction.freightInUSD ||
          currentQuote.importChargesInUSD !== transaction.importChargesInUSD ||
          currentQuote.zone !== transaction.shippingZone ||
          currentQuote.deliveryDays.min !== transaction.deliveryEstimateMinDays ||
          currentQuote.deliveryDays.max !== transaction.deliveryEstimateMaxDays
        ) {
          await markRefundRequired()
        }

        await decrementInventory(database, items)
      } catch (error) {
        if (error instanceof CheckoutItemUnavailableError) await markRefundRequired()
        throw error
      }

      const order = await req.payload.create({
        collection: 'orders',
        data: {
          amount: transaction.amount,
          checkoutLocale,
          currency: 'USD',
          ...(transactionCustomerID
            ? { customer: transactionCustomerID }
            : { customerEmail: transaction.customerEmail }),
          ddpPricingVersion: transaction.ddpPricingVersion,
          deliveryEstimateMaxDays: transaction.deliveryEstimateMaxDays,
          deliveryEstimateMinDays: transaction.deliveryEstimateMinDays,
          freightInUSD: transaction.freightInUSD,
          importChargesInUSD: transaction.importChargesInUSD,
          items,
          shippingAddress,
          shippingAmountInUSD: transaction.shippingAmountInUSD,
          shippingZone: transaction.shippingZone,
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      await req.payload.update({
        collection: 'carts',
        data: { purchasedAt: now().toISOString(), status: 'purchased' },
        id: initialCartID,
        overrideAccess: true,
        req,
      })
      await req.payload.update({
        collection: 'transactions',
        data: { order: order.id, status: 'succeeded' },
        id: transaction.id,
        overrideAccess: true,
        req,
      })

      await commitTransaction(req)
      settled = true
      return confirmationResponse(order)
    } catch (error) {
      if (!settled) await killTransaction(req)
      throw error
    }
  }

  const confirmOrder: PaymentAdapter['confirmOrder'] = async ({
    cartsSlug = 'carts',
    data,
    ordersSlug = 'orders',
    req,
    transactionsSlug = 'transactions',
  }) => {
    if (cartsSlug !== 'carts' || ordersSlug !== 'orders' || transactionsSlug !== 'transactions') {
      throw new Error('ODSai order collection configuration is invalid.')
    }

    return confirmPayment({ data, req })
  }

  const previousSucceededWebhook = props.webhooks?.['payment_intent.succeeded']
  const baseAdapter = stripeAdapter({
    ...props,
    webhooks: {
      ...props.webhooks,
      'payment_intent.succeeded': async (args) => {
        const paymentIntent = args.event.data.object as Stripe.PaymentIntent
        const transaction = await findTransaction(args.req, paymentIntent.id)

        if (transaction) {
          try {
            await confirmPayment({
              data: { paymentIntentID: paymentIntent.id },
              req: args.req,
              trustedServerRequest: true,
            })
          } catch (error) {
            if (!(error instanceof RefundedPaymentError)) throw error
          }
        }

        await previousSucceededWebhook?.(args)
      },
    },
  })

  return {
    ...baseAdapter,
    confirmOrder,
    initiatePayment,
  }
}
