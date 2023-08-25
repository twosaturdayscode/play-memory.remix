type MemoryCardStatus = 'covered' | 'discovered' | 'selected'

export type MemoryCard = {
	id: number
	pairId: number
	image: {
		src: string
	}
	status: MemoryCardStatus
}

export class MemoryCardCollection {
	constructor(private cr: MemoryCard[]) {}

	static fromDeck(d: MemoryCard[]) {
		return new MemoryCardCollection(d)
	}

	findAll() {
		return this.cr
	}

	find(id: number) {
		const crd = this.cr.find(c => c.id === id)

		if (!crd) throw Error(`No card with id: ${id}`)

		return crd
	}

	patch(id: number, patcher: (card: MemoryCard) => MemoryCard) {
		const index = this.cr.findIndex(c => c.id === id)

		if (index === -1) throw Error(`No card with id: ${id}`)

		this.cr[index] = patcher(this.cr[index])
	}
}

export class Dealer {
	constructor(private cc: MemoryCardCollection) {}

	static useCards(cardsCollection: MemoryCardCollection) {
		return new Dealer(cardsCollection)
	}

	getCardsOnTable() {
		/** We don't want to send the pair id to client */
		return this.cc.findAll().map(({ pairId, ...card }) => card)
	}

	selectCard(cardId: number) {
		if (this.canSelectCard(cardId)) {
			return this.cc.patch(cardId, c => ({ ...c, status: 'selected' }))
		}

		throw Error('User cannot select this card')
	}

	checkSelection() {
		const [card1, card2] = this.cc
			.findAll()
			.filter(c => c.status === 'selected')

		if (!card1 || !card2) {
			throw Error('To check selection there must be selected 2 cards')
		}

		const isPair = card1.pairId === card2.pairId

		if (isPair) {
			/** @todo increase game session pts */
			this.cc.patch(card1.id, c => ({ ...c, status: 'discovered' }))
			this.cc.patch(card2.id, c => ({ ...c, status: 'discovered' }))
			return
		}

		this.cc.patch(card1.id, c => ({ ...c, status: 'covered' }))
		this.cc.patch(card2.id, c => ({ ...c, status: 'covered' }))
		return
	}

	private canSelectCard(cardId: number) {
		const selectedCards = this.cc.findAll().filter(c => c.status === 'selected')

		return (
			selectedCards.length <= 1 &&
			!selectedCards.map(c => c.id).includes(cardId)
		)
	}
}

export const makeMemoryCards = (quantity: number): MemoryCard[] =>
	Array(quantity)
		.fill({})
		.map((_, i) => {
			const pairId = i < quantity / 2 ? i : i - quantity / 2

			return {
				id: i,
				pairId,
				image: {
					src: `https://loremflickr.com/320/240?lock=${pairId}`,
				},
				status: 'covered',
			}
		})
