import type { Game, GameProps, GamesCollection } from 'src/concepts'

export class GamesCollectionInMem implements GamesCollection {
	constructor(private games: Game[]) {}

	static fromGamesList(gamesList: Game[]) {
		return new GamesCollectionInMem(gamesList)
	}

	async find(id: string): Promise<Game> {
		const gme = this.games.find(g => g.id === id)

		if (!gme) throw Error(`No games found with id: ${id}`)

		return gme
	}

	async list(): Promise<Game[]> {
		return this.games
	}

	async save(id: string, gamePs: GameProps): Promise<void> {
		const i = this.games.findIndex(g => g.id === id)

		if (i < 0) this.games.push({ id, ...gamePs })

		this.games[i] = { id, ...gamePs }
	}

	async patch(id: string, patcher: (g: Game) => Game): Promise<void> {
		const index = this.games.findIndex(g => g.id === id)

		if (index === -1) throw Error(`No games with id: ${id}`)

		this.games[index] = patcher(this.games[index])
	}
}
