/** support types */
type Patcher<T> = (el: T) => T

type SimpleCollectionOf<R extends object & { id: string }> = {
	find(id: string): R
	list(): R[]
	patch(id: string, patcher: Patcher<R>): void
	add(id: string, props: Omit<R, 'id'>): void
	/** @todo: add delete */
	// delete(id: string): void
}

/** A fixed collection, is simply a collection with a constant number of elements */
type FixedCollectionOf<R extends object & { id: string }> = Omit<
	SimpleCollectionOf<R>,
	'add'
	// 'add' | 'delete'
>

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

export interface MemoryCardsCollection extends FixedCollectionOf<MemoryCard> {}

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

export interface PlayersCollection extends SimpleCollectionOf<Player> {}

export class Dealer {
	constructor(private cc: MemoryCardsCollection) {}

	static summon(cardsCollection: MemoryCardsCollection) {
		return new Dealer(cardsCollection)
	}

	getCardsOnTable() {
		/** We don't want to send the pair id to client */
		return this.cc.list().map(({ pairId, ...card }) => card)
	}

	selectCard(cardId: string) {
		if (this.canSelectCard(cardId)) {
			return this.cc.patch(cardId, c => ({ ...c, status: 'selected' }))
		}

		throw Error('User cannot select this card')
	}

	checkSelection(): {
		result: 'hit' | 'miss'
	} {
		const [card1, card2] = this.cc.list().filter(c => c.status === 'selected')

		if (!card1 || !card2) {
			throw Error('To check selection there must be selected 2 cards')
		}

		const isPair = card1.pairId === card2.pairId

		if (isPair) {
			/** @todo increase game session pts */
			this.cc.patch(card1.id, c => ({ ...c, status: 'discovered' }))
			this.cc.patch(card2.id, c => ({ ...c, status: 'discovered' }))
			return { result: 'hit' }
		}

		this.cc.patch(card1.id, c => ({ ...c, status: 'covered' }))
		this.cc.patch(card2.id, c => ({ ...c, status: 'covered' }))
		return { result: 'miss' }
	}

	private canSelectCard(cardId: string) {
		const selectedCards = this.cc.list().filter(c => c.status === 'selected')

		return (
			selectedCards.length <= 1 &&
			!selectedCards.map(c => c.id).includes(cardId)
		)
	}
}

export class GamesManager {
	constructor(private gc: GamesCollection) {}

	static summon(gamesCollection: GamesCollection) {
		return new GamesManager(gamesCollection)
	}

	listGames() {
		return this.gc.list()
	}

	findGame(id: string) {
		return this.gc.find(id)
	}

	getGameScoreUpdater(id: string) {
		const updateScoreWith = (pts: number) => () =>
			this.gc.patch(id, g => ({ ...g, score: g.score + pts }))

		return updateScoreWith
	}

	newGame(id: string, board: MemoryCard[]) {
		const newGame: Game = {
			id,
			board,
			score: 0,
		}

		return this.gc.add(id, newGame)
	}

	updateGameBoard(id: string, board: MemoryCard[]) {
		return this.gc.patch(id, g => ({ ...g, board }))
	}
}

export class PlayersManager {
	constructor(private pc: PlayersCollection) {}

	static summon(playersCollection: PlayersCollection) {
		return new PlayersManager(playersCollection)
	}

	listPlayers() {
		return this.pc.list()
	}

	findPlayer(id: string) {
		return this.pc.find(id)
	}

	addPlayer(id: string) {
		console.log(`New player added with id: ${id}`)
		return this.pc.add(id, { games: [] })
	}

	addNewGameToPlayer(id: string, gameId: string) {
		this.pc.patch(id, p => ({ ...p, games: [...p.games, gameId] }))
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
