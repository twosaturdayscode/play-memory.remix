import {
	type V2_MetaFunction,
	type LoaderArgs,
	type ActionArgs,
	json,
	redirect,
} from '@remix-run/cloudflare'
import { getSession, commitSession } from '../../configuration/session.server'
import { nanoid } from 'nanoid/non-secure'
import { Form, useLoaderData } from '@remix-run/react'
import { validateFormData } from './validations'
import { makeMemoryCards } from 'src/concepts'
import { shuffle } from 'src/utils/shuffle'
export const meta: V2_MetaFunction = () => {
	return [{ title: 'Home | Memory Remix' }]
}

export const action = async ({ request, context }: ActionArgs) => {
	const fd = Object.fromEntries(await request.formData())
	const { _action } = validateFormData(fd)

	const session = await getSession(request.headers.get('Cookie'))
	const userId = session.get('userId')! // I hate this exclamation point

	if (_action === 'new-game') {
		// Create a new game
		const newGameId = nanoid(5)

		const newDeck = makeMemoryCards(16)
		await context.gamesCollection.save(newGameId, {
			board: shuffle(newDeck),
			score: 0,
		})
		await context.playersManager.addGameToPlayer(userId, newGameId)
		return redirect(`/play/${newGameId}`)
	}
}

export const loader = async ({ request, context }: LoaderArgs) => {
	const session = await getSession(request.headers.get('Cookie'))
	const h = new Headers()
	const playersManager = context['playersManager']

	/**
	 * Since it's a demo app I did not want to put too much effort in
	 * authentication process.
	 *
	 * If the user has no user id in his cookies, we just assign one randomly
	 * and add it in the user collection.
	 */
	if (!session.has('userId')) {
		const newUserId = nanoid(10)
		playersManager.addPlayer(newUserId)

		session.set('userId', newUserId)
		h.append('Set-Cookie', await commitSession(session))

		return json({ games: [], userId: newUserId }, { headers: h })
	}

	const userId = session.get('userId')! // I hate this exclamation point
	h.append('Set-Cookie', await commitSession(session))

	const { games: userGamesList } = await playersManager.findPlayer(userId)
	const games = await Promise.all(
		userGamesList.map(id => context.gamesCollection.find(id)),
	)

	return json(
		{ games: games.map(g => ({ id: g.id, score: g.score })), userId },
		{ headers: h },
	)
}

export default function Index() {
	const { games, userId } = useLoaderData<typeof loader>()

	return (
		<main className="mx-auto max-w-3xl py-36">
			<div>
				<header className="flex flex-col gap-5 mb-10">
					<span>user id: {userId}</span>
					<h1 className="text-3xl font-semibold">Welcome to Memory Remix!</h1>
					<p className="text-stone-600">
						This project is a simple demo to train on SOLID principles and
						Domain Driven Design.
						<br />
						Let's play a game!
					</p>
				</header>
				<ol className="flex flex-col gap-5 mb-20">
					{games.map(g => (
						<li
							key={g.id}
							className="flex justify-between items-center w-full px-20"
						>
							<header className="flex flex-col gap-2">
								<h1>
									Game id: <strong>{g.id}</strong>
								</h1>
								<p>
									Game score: <strong>{g.score}</strong>
								</p>
							</header>
							<a href={`play/${g.id}`} className="underline">
								Go to game
							</a>
						</li>
					))}
				</ol>
				<div className="flex justify-end px-20">
					<Form method="POST">
						<button
							name="_action"
							value="new-game"
							className="py-3 px-7 rounded text-white bg-stone-950 border-stone-900 border-2 hover:bg-white hover:text-stone-900 transition duration-200"
						>
							<span className="text-xl font-bold">New game</span>
						</button>
					</Form>
				</div>
			</div>
		</main>
	)
}
