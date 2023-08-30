// app/sessions.ts
import { createCookieSessionStorage } from '@remix-run/cloudflare'

type SessionData = {
	userId: string
}

type SessionFlashData = {
	error: string
}

const { getSession, commitSession, destroySession } =
	createCookieSessionStorage<SessionData, SessionFlashData>({
		// a Cookie from `createCookie` or the CookieOptions to create one
		cookie: {
			name: '__session',

			httpOnly: true,
			maxAge: 2147483647,
			path: '/',
			sameSite: 'lax',
			secrets: ['s3cret1'],
			secure: true,
		},
	})

export { getSession, commitSession, destroySession }
