import { Dealer, type MemoryCard, makeMemoryCards } from 'src/concepts'

import { describe, expect, test } from 'vitest'

test('Deck is consistent', () => {
	const cards = makeMemoryCards(16)

	expect(
		cards
			.map(c => c.pairId)
			.every((pid, i) => (i < 16 / 2 ? pid === i : pid === i - 16 / 2)),
	).toBe(true)

	expect(cards.map(c => c.id).every(id => Number(id) >= 0)).toBe(true)
})

describe('Dealer can be trusted', t => {
	t('Correct number of cards employed', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const dlr = Dealer.summon(deck)

		const table = dlr.listMemoryCards()

		expect(table.length).toBe(16)
	})

	t('All cards are initially covered', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const dlr = Dealer.summon(deck)

		const table = dlr.listMemoryCards()

		expect(table.every(c => c.status === 'covered')).toBe(true)
	})

	t('Dealer selects first card for user', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const dlr = Dealer.summon(deck)

		const table = dlr.listMemoryCards()

		dlr.selectCard(table[0].id)

		console.log(table)

		expect(table[0].status === 'selected').toBe(true)
	})

	t('Dealer selects first two cards for user', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const dlr = Dealer.summon(deck)

		const [first, second] = dlr.listMemoryCards()

		dlr.selectCard(first.id)
		dlr.selectCard(second.id)

		expect(first.status === 'selected' && second.status === 'selected').toBe(
			true,
		)
	})

	test.fails(
		'Dealer tries to select a third card for user. not allowed',
		async () => {
			/** init */
			const deck = makeMemoryCards(16)
			const dlr = Dealer.summon(deck)

			const [first, second, third] = dlr.listMemoryCards()

			dlr.selectCard(first.id)
			dlr.selectCard(second.id)

			expect(dlr.selectCard(third.id)).rejects.toBe(1)
		},
	)

	t(
		'Dealer selects 2 cards that are a pair and check them, they become discovered',
		() => {
			/** init */
			const deck = makeMemoryCards(16)
			const dlr = Dealer.summon(deck)

			const [target] = dlr.listMemoryCards()

			const [p1, p2] = dlr.listMemoryCards().reduce((acc, curr) => {
				if (curr.pairId === target.pairId) {
					acc.push(curr)
					return acc
				}

				return acc
			}, [] as MemoryCard[])

			dlr.selectCard(p1.id)
			dlr.selectCard(p2.id)

			dlr.checkSelection()

			expect(p1.status === 'discovered' && p2.status === 'discovered').toBe(
				true,
			)
		},
	)

	t(
		'Dealer selects 2 cards that are NOT a pair and check them, they become covered again',
		() => {
			/** init */
			const deck = makeMemoryCards(16)
			const dlr = Dealer.summon(deck)

			const [p1, p2] = dlr.listMemoryCards()

			dlr.selectCard(p1.id)
			dlr.selectCard(p2.id)

			dlr.checkSelection()

			expect(p1.status === 'covered' && p2.status === 'covered').toBe(true)
		},
	)

	t('Dealer can select third card after discovering a pair', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const dlr = Dealer.summon(deck)

		const [target, third] = dlr.listMemoryCards()

		const [p1, p2] = dlr.listMemoryCards().reduce((acc, curr) => {
			if (curr.pairId === target.pairId) {
				acc.push(curr)
				return acc
			}

			return acc
		}, [] as MemoryCard[])

		dlr.selectCard(p1.id)
		dlr.selectCard(p2.id)

		dlr.checkSelection()

		dlr.selectCard(third.id)

		expect(
			p1.status === 'discovered' &&
				p2.status === 'discovered' &&
				third.status === 'selected',
		).toBe(true)
	})
})
