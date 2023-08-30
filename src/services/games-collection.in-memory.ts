import type { Game, GameProps, GamesCollection } from 'src/concepts'

export class GamesCollectionInMem implements GamesCollection {
	constructor(private games: Game[]) {}

	static fromGamesList(gamesList: Game[]) {
		return new GamesCollectionInMem(gamesList)
	}

	find(id: string): Game {
		const gme = this.games.find(g => g.id === id)

		if (!gme) throw Error(`No games found with id: ${id}`)

		return gme
	}

	list(): Game[] {
		return this.games
	}

	add(id: string, gamePs: GameProps): void {
		this.games.push({ id, ...gamePs })
		return
	}

	patch(id: string, patcher: (g: Game) => Game): void {
		const index = this.games.findIndex(g => g.id === id)

		if (index === -1) throw Error(`No games with id: ${id}`)

		this.games[index] = patcher(this.games[index])
	}
}
