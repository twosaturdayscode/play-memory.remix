import {
	type ActionArgs,
	type LoaderArgs,
	json,
	redirect,
} from '@remix-run/cloudflare'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { MemoryCard } from './components/memory-card'
import { validateFormData } from './validations'
import { wait } from '~/utils/wait'
import { useState } from 'react'
import { Dealer } from 'src/concepts'

const DEFAULT_BOARD_SIZE = 4

export const action = async ({ request, params, context }: ActionArgs) => {
	const f = validateFormData(Object.fromEntries(await request.formData()))
	const gameId = params.gameId

	if (!gameId) {
		return redirect('/')
	}

	const game = await context.gamesCollection.find(gameId)
	const dealer = Dealer.summon(game.board)

	if (f._action === 'select-card') {
		dealer.selectCard(f.cardId)
		await context.gamesCollection.save(gameId, {
			...game,
			board: dealer.listMemoryCards(),
		})
	}

	if (f._action === 'check-selection') {
		const { result } = dealer.checkSelection()
		await context.gamesCollection.save(gameId, {
			...game,
			board: dealer.listMemoryCards(),
			score: result === 'hit' ? game.score + 10 : game.score - 5,
		})
	}

	return null
}

export const loader = async ({ context, params }: LoaderArgs) => {
	const gameId = params.gameId

	if (!gameId) {
		return redirect('/')
	}

	const game = await context.gamesCollection.find(gameId)
	const dealer = Dealer.summon(game.board)

	const boardCards = dealer.getCardsOnTable()

	return json({ boardCards, score: game.score })
}

export default function PlayPage() {
	const { boardCards, score } = useLoaderData<typeof loader>()
	const fetcher = useFetcher()

	const [isWaiting, setIsWaiting] = useState(false)

	/**
	 * We check if the selected cards are a pair only
	 * when we have selected 2 cards
	 */
	const shouldCheck =
		boardCards.filter(c => c.status === 'selected').length === 1

	/**
	 * Selects a card. If the selected card is the
	 * second selection, we also ask the server if they
	 * are a pair.
	 */
	const selectCard = async (cardId: string) => {
		fetcher.submit(
			{ _action: 'select-card', cardId },
			{ method: 'POST', replace: true },
		)

		if (shouldCheck) {
			// Give some time to the user to see the images
			setIsWaiting(true)
			await wait(600)

			/**
			 * Check if the cards are a pair,
			 * eventually they will go covered again or become discovered
			 */
			fetcher.submit(
				{ _action: 'check-selection' },
				{ method: 'POST', replace: true },
			)

			setIsWaiting(false)
		}
	}

	return (
		<main className="mx-auto max-w-5xl py-14">
			<header className="flex flex-col gap-5">
				<a href="/" className="underline">
					Back to home
				</a>
				<div>
					<h1 className="text-xl font-semibold tracking-wide">Memory Remix</h1>
					<p className="text-stone-500">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus
						odit autem modi voluptatibus non unde doloribus corrupti, cum
						voluptatum. Quas consequatur enim quisquam reprehenderit quia
						incidunt reiciendis ipsam. Sit, fugit!
					</p>
				</div>
				<div>
					<p>
						Your score is: <span className="text-xl">{score}</span>
					</p>
				</div>
			</header>
			<div className="mt-10 flex max-w-4xl shrink grow-0 px-20">
				<div
					className="grid h-full w-full gap-10"
					style={{
						gridTemplateColumns: `repeat(${DEFAULT_BOARD_SIZE}, 1fr)`,
						gridTemplateRows: `repeat(${DEFAULT_BOARD_SIZE}, 1fr)`,
					}}
				>
					{boardCards.map(c => (
						<fetcher.Form method="post" key={c.id}>
							<MemoryCard
								image={c.image}
								isUncovered={
									c.status === 'discovered' || c.status === 'selected'
								}
								id={c.id}
								onClick={selectCard}
								/**
								 * While we give the time to the user to see the images,
								 * we prevent him/her from clicking a third card
								 */
								disabled={
									isWaiting ||
									c.status === 'discovered' ||
									c.status === 'selected'
								}
							/>
						</fetcher.Form>
					))}
				</div>
			</div>
		</main>
	)
}
