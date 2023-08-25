import { type ActionArgs, json } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { MemoryCard } from './components/memory-card'
import { dealer } from '~/configuration'
import { validateFormData } from './validations'
import { wait } from '~/utils/wait'
import { useState } from 'react'

const DEFAULT_BOARD_SIZE = 4

export const action = async ({ request }: ActionArgs) => {
	const fd = await request.formData()
	const f = validateFormData(Object.fromEntries(fd))

	if (f._action === 'select-card') {
		dealer.selectCard(f.cardId)
	}

	if (f._action === 'check-selection') {
		dealer.checkSelection()
	}

	return null
}

export const loader = async () => {
	const boardCards = dealer.getCardsOnTable()

	return json({ boardCards })
}

export default function PlayPage() {
	const { boardCards } = useLoaderData<typeof loader>()
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
	const selectCard = async (cardId: number) => {
		fetcher.submit(
			{ _action: 'select-card', cardId },
			{ method: 'POST', replace: true },
		)

		if (shouldCheck) {
			// Give some time to the user to see the images
			setIsWaiting(true)
			await wait(700)

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
		<main className="mx-auto max-w-5xl py-20">
			<header className="flex flex-col gap-5">
				<div>
					<h1 className="text-xl font-semibold tracking-wide">Memory Remix</h1>
					<p className="text-stone-500">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus
						odit autem modi voluptatibus non unde doloribus corrupti, cum
						voluptatum. Quas consequatur enim quisquam reprehenderit quia
						incidunt reiciendis ipsam. Sit, fugit!
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
								disabled={isWaiting || c.status === 'discovered'}
							/>
						</fetcher.Form>
					))}
				</div>
			</div>
		</main>
	)
}
