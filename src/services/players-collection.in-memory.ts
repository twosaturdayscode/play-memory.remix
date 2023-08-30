import type { Player, PlayerProps, PlayersCollection } from 'src/concepts'

export class PlayersCollectionInMem implements PlayersCollection {
	constructor(private players: Player[]) {}

	static fromPlayerList(playersList: Player[]) {
		return new PlayersCollectionInMem(playersList)
	}

	find(id: string): Player {
		const plr = this.players.find(g => g.id === id)

		if (!plr) throw Error(`No player found with id: ${id}`)

		return plr
	}

	list(): Player[] {
		return this.players
	}

	add(id: string, playerPs: PlayerProps): void {
		this.players.push({ id, ...playerPs })
		return
	}

	patch(id: string, patcher: (p: Player) => Player): void {
		const index = this.players.findIndex(p => p.id === id)

		if (index === -1) throw Error(`No player with id: ${id}`)

		this.players[index] = patcher(this.players[index])
	}
}
