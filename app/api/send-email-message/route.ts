import { NextResponse } from 'next/server'
import nodemailer, { type Transporter } from 'nodemailer'

type PostBody = {
  subject?: string
  text?: string
  html?: string
  email?: string
}

function checkIfEmailEnabled(): boolean {
  return !!(
    process.env.EMAIL_FROM_EMAIL &&
    process.env.EMAIL_SERVER_HOST &&
    process.env.EMAIL_SERVER_PORT &&
    process.env.EMAIL_SERVER_USER &&
    process.env.EMAIL_SERVER_PASSWORD
  )
}

let transporter: Transporter

const getTransporter = () => {
  if (transporter) {
    return transporter
  }

  const host = process.env.EMAIL_SERVER_HOST
  const port = parseInt(process.env.EMAIL_SERVER_PORT ?? '')
  const user = process.env.EMAIL_SERVER_USER
  const pass = process.env.EMAIL_SERVER_PASSWORD

  if (!host) {
    return
  }

  const transport = {
    host,
    secure: port === 465,
    port,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV !== 'development',
    },
  }

  transporter = nodemailer.createTransport(transport)
  return transporter
}

async function sendMail(
  email: string,
  subject: string,
  text?: string,
  html?: string,
  replyTo?: string,
) {
  const transporter = getTransporter()
  try {
    if (transporter) {
      await transporter.sendMail({
        to: email,
        from: `${process.env.EMAIL_FROM_NAME || 'KioskPOS'} <${
          process.env.EMAIL_FROM_EMAIL
        }>`,
        subject,
        text,
        html,
        replyTo,
      })

      console.log('Email sent')
      return true
    } else {
      console.log('SMTP server not configured, so skipping')
    }
  } catch (error) {
    console.error('Error sending email', error)
  }

  return false
}

export async function POST(request: Request) {
  try {
    console.log('POST request received')
    const isEnabled = checkIfEmailEnabled()
    if (!isEnabled) {
      return NextResponse.json({ success: true })
    }

    const { subject, text, html, email }: PostBody = await request.json()

    if (!subject || !(text || html) || !email) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 },
      )
    }

    await sendMail(email, subject, text, html)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending marketing message:', error)
    return NextResponse.json(
      { error: 'Could not send marketing message' },
      { status: 500 },
    )
  }
}
