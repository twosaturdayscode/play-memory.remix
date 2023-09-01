import type { Player, PlayerProps, PlayersCollection } from 'src/concepts'

export class PlayersCollectionInMem implements PlayersCollection {
	constructor(private players: Player[]) {}

	static fromPlayerList(playersList: Player[]) {
		return new PlayersCollectionInMem(playersList)
	}

	async find(id: string): Promise<Player> {
		const plr = this.players.find(g => g.id === id)

		if (!plr) throw Error(`No player found with id: ${id}`)

		return plr
	}

	async save(id: string, playerPs: PlayerProps): Promise<void> {
		this.players.push({ id, ...playerPs })
		return
	}

	async patch(id: string, patcher: (p: Player) => Player): Promise<void> {
		const index = this.players.findIndex(p => p.id === id)

		if (index === -1) throw Error(`No player with id: ${id}`)

		this.players[index] = patcher(this.players[index])
	}
}
