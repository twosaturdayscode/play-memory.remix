import type { GamesCollection } from 'src/concepts'
import { GamesCollectionInMem } from 'src/services/games-collection.in-memory'

declare global {
	var _gamesCollection: GamesCollection
}

class SingletonGamesCollection {
	private static _instance: SingletonGamesCollection
	private gc: GamesCollection

	private constructor() {
		this.gc = GamesCollectionInMem.fromGamesList([])

		if (process.env.NODE_ENV === 'development') {
			// In development mode, use a global variable so that the value
			// is preserved across module reloads caused by HMR (Hot Module Replacement).
			global._gamesCollection = this.gc
		}
	}

	public static get instance() {
		if (!this._instance) {
			this._instance = new SingletonGamesCollection()
		}
		return this._instance.gc
	}
}

const gamesCollection = SingletonGamesCollection.instance

export { gamesCollection }
