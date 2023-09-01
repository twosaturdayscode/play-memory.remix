import type { Game, GameProps, GamesCollection } from 'src/concepts'

export class GamesCollectionCloudKV implements GamesCollection {
	constructor(private kv: KVNamespace) {}

	static setup(kv: KVNamespace) {
		return new GamesCollectionCloudKV(kv)
	}

	async find(id: string): Promise<Game> {
		const v = await this.kv.get<GameProps>(id, 'json')

		if (!v) throw Error(`No Game found with id: ${id}`)

		return {
			id: id,
			board: v.board,
			score: v.score,
		}
	}

	async list(): Promise<Game[]> {
		const gamesIdList = (await this.kv.list<string>()).keys.map(k => k.name)

		const games = await Promise.all(gamesIdList.map(id => this.find(id)))

		return games
	}

	async save(id: string, GamePs: GameProps): Promise<void> {
		await this.kv.put(id, JSON.stringify(GamePs))
		return
	}

	async patch(id: string, patcher: (p: Game) => Game): Promise<void> {
		const v = await this.find(id)
		const newV = patcher(v)

		await this.kv.put(id, JSON.stringify(newV))
		return
	}
}
