import { NextResponse } from 'next/server'
import { getSlackUserIdByEmail, postSlackMessage } from '@/utils/slack-service'

type PostBody = {
  slackPayload?: Record<string, unknown>
  text?: string
  email?: string
  channel?: string
}

function getAuthTokenForSlack(): string | null {
  return process.env.SLACK_AUTH_TOKEN ?? null
}

export async function POST(request: Request) {
  try {
    const authToken = getAuthTokenForSlack()
    if (!authToken) {
      return NextResponse.json({ success: true })
    }

    const { slackPayload, text, email, channel }: PostBody =
      await request.json()
    if (!(slackPayload || text) || !(email || channel)) {
      return NextResponse.json(
        { error: 'Missing required information' },
        { status: 400 },
      )
    }

    const userIdOrChannel = email
      ? await getSlackUserIdByEmail(authToken, email)
      : channel
    if (!userIdOrChannel) {
      return NextResponse.json(
        { error: `Could not find Slack channel: ${email || channel}` },
        { status: 404 },
      )
    }
    const body = slackPayload ? slackPayload : { text }
    const result = await postSlackMessage(authToken, {
      ...body,
      channel: userIdOrChannel,
    })

    if (!result.httpOk || !result.apiOk) {
      return NextResponse.json(
        { error: `Failed to send Slack notification: ${result.statusText}` },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending marketing message:', error)
    return NextResponse.json(
      { error: 'Could not send marketing message' },
      { status: 500 },
    )
  }
}
