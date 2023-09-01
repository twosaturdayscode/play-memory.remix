/** support types */
type Patcher<T> = (el: T) => T

type SimpleCollectionOf<R extends object & { id: string }> = {
	find(id: string): Promise<R>
	// list(): Promise<R[]>
	patch(id: string, patcher: Patcher<R>): Promise<void>
	save(id: string, props: Omit<R, 'id'>): Promise<void>
	/** @todo: add delete */
	// delete(id: string): void
}

/** MEMORY CARDS */

type MemoryCardStatus = 'covered' | 'discovered' | 'selected'

export type MemoryCard = {
	id: string
	pairId: number
	image: {
		src: string
	}
	status: MemoryCardStatus
}

/** GAMES */

export type Game = {
	id: string
	board: MemoryCard[]
	score: number
}

export type GameProps = Omit<Game, 'id'>

export interface GamesCollection extends SimpleCollectionOf<Game> {}

export type Player = {
	id: string
	games: Game['id'][]
}

export type PlayerProps = Omit<Player, 'id'>

export interface PlayersCollection
	extends Omit<SimpleCollectionOf<Player>, 'list'> {}

export class Dealer {
	// @question: maybe instead of an array a Map could be better
	constructor(
		private cc: MemoryCard[], // private gc: GamesCollection,
	) {}

	static summon(deck: MemoryCard[] /* gamesCollection: GamesCollection */) {
		return new Dealer(deck /* gamesCollection */)
	}

	getCardsOnTable() {
		/** We don't want to send the pair id to client */
		return this.cc.map(({ pairId, ...card }) => card)
	}

	/**
	 * For testing
	 */
	listMemoryCards() {
		return this.cc
	}

	selectCard(cardId: string) {
		if (this.canSelectCard(cardId))
			return this.setCardStatus(cardId, 'selected')

		throw Error('User cannot select this card')
	}

	checkSelection(): {
		result: 'hit' | 'miss'
	} {
		const [card1, card2] = this.cc.filter(c => c.status === 'selected')

		if (!card1 || !card2) {
			throw Error('To check selection there must be selected 2 cards')
		}

		const isPair = card1.pairId === card2.pairId

		if (isPair) {
			this.setCardStatus(card1.id, 'discovered')
			this.setCardStatus(card2.id, 'discovered')
			return { result: 'hit' }
		}

		this.setCardStatus(card1.id, 'covered')
		this.setCardStatus(card2.id, 'covered')
		return { result: 'miss' }
	}

	private canSelectCard(cardId: string) {
		const selectedCards = this.cc.filter(c => c.status === 'selected')

		return (
			selectedCards.length <= 1 &&
			!selectedCards.map(c => c.id).includes(cardId)
		)
	}

	private setCardStatus(cardId: string, status: MemoryCard['status']) {
		const i = this.cc.findIndex(c => c.id === cardId)

		if (i < 0) throw Error(`Can't update card with id: ${cardId}`)

		this.cc[i].status = status
	}
}

export class PlayersManager {
	constructor(private pc: PlayersCollection) {}

	static summon(playersCollection: PlayersCollection) {
		return new PlayersManager(playersCollection)
	}

	findPlayer(id: string) {
		return this.pc.find(id)
	}

	addPlayer(id: string) {
		console.log(`New player added with id: ${id}`)
		return this.pc.save(id, { games: [] })
	}

	addGameToPlayer(id: string, gameId: string) {
		return this.pc.patch(id, p => ({ ...p, games: [...p.games, gameId] }))
	}
}

export const makeMemoryCards = (quantity: number): MemoryCard[] =>
	Array(quantity)
		.fill({})
		.map((_, i) => {
			const pairId = i < quantity / 2 ? i : i - quantity / 2

			return {
				id: i.toString(),
				pairId,
				image: {
					src: `https://loremflickr.com/320/240?lock=${pairId}`,
				},
				status: 'covered',
			}
		})
