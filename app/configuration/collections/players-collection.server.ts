import type { PlayersCollection } from 'src/concepts'
import { PlayersCollectionInMem } from 'src/services/players-collection.in-memory'

declare global {
	var _playersCollection: PlayersCollection
}

class SingletonPlayersCollection {
	private static _instance: SingletonPlayersCollection
	private pc: PlayersCollection

	private constructor() {
		this.pc = PlayersCollectionInMem.fromPlayerList([{ id: 'test', games: [] }])

		if (process.env.NODE_ENV === 'development') {
			// In development mode, use a global variable so that the value
			// is preserved across module reloads caused by HMR (Hot Module Replacement).
			global._playersCollection = this.pc
		}
	}

	public static get instance() {
		if (!this._instance) {
			this._instance = new SingletonPlayersCollection()
		}
		return this._instance.pc
	}
}

const playersCollection = SingletonPlayersCollection.instance

export { playersCollection }
