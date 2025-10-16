type SlackUserLookupResponse = {
  ok: boolean
  user?: { id?: string }
}

type SlackPostMessageResponse = {
  ok: boolean
}

type PostBody = {
  slackPayload?: Record<string, unknown>
  email?: string
  channel?: string
}

export async function getSlackUserIdByEmail(authToken: string, email: string) {
  const res = await fetch(
    `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(
      email,
    )}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    },
  )
  const data: SlackUserLookupResponse = await res.json()
  if (!data.ok || !data.user?.id) {
    return null
  }
  return data.user.id
}

export async function postSlackMessage(authToken: string, body: PostBody) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data: SlackPostMessageResponse = await res.json()
  return { httpOk: res.ok, apiOk: data.ok, statusText: res.statusText }
}
