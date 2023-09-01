import type { Player, PlayerProps, PlayersCollection } from 'src/concepts'

export class PlayersCollectionCloudKV implements PlayersCollection {
	constructor(private kv: KVNamespace) {}

	static setup(kv: KVNamespace) {
		return new PlayersCollectionCloudKV(kv)
	}

	async find(id: string): Promise<Player> {
		const v = await this.kv.get<PlayerProps>(id, 'json')

		if (!v) throw Error(`No player found with id: ${id}`)

		return {
			id: id,
			games: v.games,
		}
	}

	async save(id: string, playerPs: PlayerProps): Promise<void> {
		await this.kv.put(id, JSON.stringify(playerPs))
		return
	}

	async patch(id: string, patcher: (p: Player) => Player): Promise<void> {
		const v = await this.find(id)
		const newV = patcher(v)

		await this.kv.put(id, JSON.stringify(newV))
    return
	}
}
