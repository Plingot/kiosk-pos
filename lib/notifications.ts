import type { Product, Customer, Transaction, CartItem } from './types'
import { type useTranslation } from '@/hooks/use-translation'
import { type useCurrencyFormat } from './currency'
type NotificationPayload = {
  name: string
  email?: string | null
  items: unknown
  total: number
  newBalance: number
}

export async function sendOrderNotification(
  payload: NotificationPayload,
  t: ReturnType<typeof useTranslation>['t'],
  currencyFormat: ReturnType<typeof useCurrencyFormat>,
) {
  function formatItems(items: CartItem[]) {
    const formattedItems = items.map((item: CartItem) => {
      const variantText = item.variant ? ` (${item.variant.name})` : ''
      return `${item.quantity} ${t('pos.pc')} ${
        item.name
      }${variantText} - ${currencyFormat(item.price * item.quantity)}`
    })

    return formattedItems
  }

  function buildReceiptMessage(
    items: CartItem[],
    total: number,
    newBalance: number,
  ) {
    const formattedItems = formatItems(items)
    return `*${t('pos.receipt')} :wave:*\n\n${formattedItems.join(
      '\n',
    )}\n\n*${t('pos.total')}: ${currencyFormat(total)}*\n\n*${t(
      'pos.new-balance',
    )}: ${currencyFormat(newBalance)}*\n\n${t(
      'pos.thank-you-for-your-purchase',
    )}!`
  }

  function buildHtmlEmailString(
    items: CartItem[],
    total: number,
    newBalance: number,
  ) {
    const formattedItems = formatItems(items)
    return `
      <strong>${t('pos.receipt')} 👋</strong>
      <br/>
      <br/>
      ${formattedItems.join('<br/>')}<br/><br/>
      ${t('pos.total')}: ${currencyFormat(total)}<br/><br/>
      ${t('pos.new-balance')}: ${currencyFormat(newBalance)}<br/><br/>
      ${t('pos.thank-you-for-your-purchase')}!
    `
  }

  const { email, items, total, newBalance } = payload as {
    email: string
    items: CartItem[]
    total: number
    newBalance: number
  }

  const receiptMessage = buildReceiptMessage(items, total, newBalance)
  const emailTextString = buildHtmlEmailString(items, total, newBalance)

  try {
    await fetch('/api/send-slack-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: receiptMessage,
        email: email,
      }),
    })

    await fetch('/api/send-email-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: t('pos.receipt'),
        html: emailTextString,
        email: email,
      }),
    })
  } catch (notificationError) {
    console.error('Error sending Slack notification:', notificationError)
  }
}

export async function sendRequestNotification(
  product: Product,
  t: ReturnType<typeof useTranslation>['t'],
  variantName?: string,
) {
  if (process.env.NEXT_PUBLIC_SLACK_KIOSK_CHANNEL) {
    const textString = `*${t('admin.requests.new-request')} :wave:*\n\n${
      product?.name ?? ''
    }${variantName ? ` (${variantName})` : ''}\n\n`
    const htmlEmailString = `
    <strong>${t('admin.requests.new-request')} 👋</strong><br/><br/>${
      product?.name ?? ''
    }${variantName ? ` (${variantName})` : ''}`

    try {
      await fetch('/api/send-slack-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textString,
          channel: process.env.NEXT_PUBLIC_SLACK_KIOSK_CHANNEL,
        }),
      })
    } catch (notificationError) {
      console.error('Error sending Slack notification:', notificationError)
    }

    try {
      const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(';')

      if (emails) {
        for (const email of emails) {
          await fetch('/api/send-email-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subject: t('admin.requests.new-request'),
              html: htmlEmailString,
              email: email,
            }),
          })
        }
      }
    } catch (notificationError) {
      console.error('Error sending Slack notification:', notificationError)
    }
  }
  return
}

export async function sendInvoiceNotification(
  customer: Customer,
  t: ReturnType<typeof useTranslation>['t'],
  transactions: Transaction[],
  currencyFormat: ReturnType<typeof useCurrencyFormat>,
) {
  const tempPaymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK
  const paymentLink =
    tempPaymentLink?.replace('{AMOUNT}', customer.balance.toFixed(2)) ?? ''

  const encodedPaymentUrl = encodeURIComponent(paymentLink)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedPaymentUrl}&size=150x150`

  const allTransactions = transactions.filter(
    (transaction) =>
      customer.id === transaction.customerId && !transaction.paid,
  )

  const itemLines = allTransactions.flatMap((cItem) =>
    cItem.items.map(
      (item) =>
        `• ${item.quantity} ${t('admin.transactions.pc')} ${
          item.name
        } – ${currencyFormat(item.price * item.quantity)}`,
    ),
  )

  const totalLine = `${t('admin.balances.total')}: ${currencyFormat(
    customer.balance,
  )}`

  const slackPayload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${t('admin.balances.hello')} ${customer.name}!* :wave:\n\n${t(
            'admin.balances.here-is-your-invoice-from-the-kiosk',
          )}:\n\n${itemLines.join('\n')}\n\n*${totalLine}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${t(
            'admin.balances.swisha-easily-by-scanning-the-qr-code-below',
          )}. ${t('admin.balances.thank-you-for-your-purchase')} 🙌`,
        },
      },
      {
        type: 'image',
        image_url: qrCodeUrl,
        alt_text: t('admin.balances.swish-qr-code'),
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: paymentLink,
        },
      },
    ],
  }

  const htmlEmailString = `
      <strong>${t('admin.balances.hello')} ${customer.name}! 👋</strong>
      <br/>
      <br/>
      ${t('admin.balances.here-is-your-invoice-from-the-kiosk')}:<br/><br/>
      ${itemLines.join('<br/>')}<br/><br/>
      ${totalLine}
      <br/><br/>
      ${t('admin.balances.swisha-easily-by-scanning-the-qr-code-below')}. ${t(
        'admin.balances.thank-you-for-your-purchase',
      )} 🙌
      <br/>
      <img src="${qrCodeUrl}" alt="${t('admin.balances.swish-qr-code')}" />
      <br/>
      ${paymentLink}
  `

  const response = await fetch('/api/send-slack-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slackPayload,
      email: customer.email,
    }),
  })

  await fetch('/api/send-email-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: t('admin.balances.here-is-your-invoice-from-the-kiosk'),
      html: htmlEmailString,
      email: customer.email,
    }),
  })

  return response
}

export async function sendBalanceResetNotification(
  customer: Customer,
  t: ReturnType<typeof useTranslation>['t'],
  totalAmount: number,
  currencyFormat: ReturnType<typeof useCurrencyFormat>,
) {
  const textString = `*${t('admin.balances.hello')} ${
    customer.name
  }!* :wave:\n\n${t(
    'admin.balances.thank-you-for-your-payment-on',
  )} ${currencyFormat(totalAmount)}`

  const htmlEmailString = `
    <strong>${t('admin.balances.hello')} ${customer.name}! 👋</strong>
    <br/>
    <br/>
    ${t('admin.balances.thank-you-for-your-payment-on')} ${currencyFormat(
      totalAmount,
    )}
  `

  await fetch('/api/send-slack-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: textString,
      email: customer.email,
    }),
  })

  await fetch('/api/send-email-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: t('admin.requests.new-request'),
      html: htmlEmailString,
      email: customer.email,
    }),
  })
}
