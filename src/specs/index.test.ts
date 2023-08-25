import {
	Dealer,
	type MemoryCard,
	makeMemoryCards,
	MemoryCardCollection,
} from 'src/concepts'
import { describe, expect, test } from 'vitest'

test('Deck is consistent', () => {
	const cards = makeMemoryCards(16)

	expect(
		cards
			.map(c => c.pairId)
			.every((pid, i) => (i < 16 / 2 ? pid === i : pid === i - 16 / 2)),
	).toBe(true)

	expect(cards.map(c => c.id).every(id => id >= 0)).toBe(true)
})

describe('Dealer can be trusted', t => {
	t('Correct number of cards employed', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const col = MemoryCardCollection.fromDeck(deck)
		const dlr = Dealer.useCards(col)

		const table = dlr.getCardsOnTable()

		expect(table.length).toBe(16)
	})

	t('All cards are initially covered', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const col = MemoryCardCollection.fromDeck(deck)
		const dlr = Dealer.useCards(col)

		const table = dlr.getCardsOnTable()

		expect(table.every(c => c.status === 'covered')).toBe(true)
	})

	t('Dealer selects first card for user', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const col = MemoryCardCollection.fromDeck(deck)
		const dlr = Dealer.useCards(col)

		const table = dlr.getCardsOnTable()

		dlr.selectCard(table[0].id)

		const target = col.find(table[0].id)

		expect(target.status === 'selected').toBe(true)
	})

	t('Dealer selects first two cards for user', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const col = MemoryCardCollection.fromDeck(deck)
		const dlr = Dealer.useCards(col)

		const [first, second] = dlr.getCardsOnTable()

		dlr.selectCard(first.id)
		dlr.selectCard(second.id)

		const t1 = col.find(first.id)
		const t2 = col.find(second.id)

		expect(t1.status === 'selected' && t2.status === 'selected').toBe(true)
	})

	test.fails(
		'Dealer tries to select a third card for user. not allowed',
		async () => {
			/** init */
			const deck = makeMemoryCards(16)
			const col = MemoryCardCollection.fromDeck(deck)
			const dlr = Dealer.useCards(col)

			const [first, second, third] = dlr.getCardsOnTable()

			dlr.selectCard(first.id)
			dlr.selectCard(second.id)

			await expect(dlr.selectCard(third.id)).rejects.toBe(1)
		},
	)

	t(
		'Dealer selects 2 cards that are a pair and check them, they become discovered',
		() => {
			/** init */
			const deck = makeMemoryCards(16)
			const col = MemoryCardCollection.fromDeck(deck)
			const dlr = Dealer.useCards(col)

			const [target] = col.findAll()

			const [p1, p2] = col.findAll().reduce((acc, curr) => {
				if (curr.pairId === target.pairId) {
					acc.push(curr)
					return acc
				}

				return acc
			}, [] as MemoryCard[])

			dlr.selectCard(p1.id)
			dlr.selectCard(p2.id)

			dlr.checkSelection()

			const t1 = col.find(p1.id)
			const t2 = col.find(p2.id)

			expect(t1.status === 'discovered' && t2.status === 'discovered').toBe(
				true,
			)
		},
	)

	t(
		'Dealer selects 2 cards that are NOT a pair and check them, they become covered again',
		() => {
			/** init */
			const deck = makeMemoryCards(16)
			const col = MemoryCardCollection.fromDeck(deck)
			const dlr = Dealer.useCards(col)

			const [p1, p2] = col.findAll()

			dlr.selectCard(p1.id)
			dlr.selectCard(p2.id)

			dlr.checkSelection()

			const t1 = col.find(p1.id)
			const t2 = col.find(p2.id)

			expect(t1.status === 'covered' && t2.status === 'covered').toBe(
				true,
			)
		},
	)

	t('Dealer can select third card after discovering a pair', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const col = MemoryCardCollection.fromDeck(deck)
		const dlr = Dealer.useCards(col)

		const [target, third] = col.findAll()

		const [p1, p2] = col.findAll().reduce((acc, curr) => {
			if (curr.pairId === target.pairId) {
				acc.push(curr)
				return acc
			}

			return acc
		}, [] as MemoryCard[])

		dlr.selectCard(p1.id)
		dlr.selectCard(p2.id)

		dlr.checkSelection()

		const t1 = col.find(p1.id)
		const t2 = col.find(p2.id)

		dlr.selectCard(third.id)

		const t3 = col.find(third.id)

		expect(
			t1.status === 'discovered' &&
				t2.status === 'discovered' &&
				t3.status === 'selected',
		).toBe(true)
	})
})

describe('Memory cards collection behavior', t => {
	t('Patching works', () => {
		/** init */
		const deck = makeMemoryCards(16)
		const col = MemoryCardCollection.fromDeck(deck)

		const cards = col.findAll()

		const { id } = cards[0]

		col.patch(id, c => ({ ...c, status: 'selected' }))

		expect(cards[0].status === 'selected').toBe(true)
	})
})
