import { MemoryCardCollection, makeMemoryCards } from 'src/concepts'
import { shuffle } from 'src/utils/shuffle'

declare global {
	var _MemoryCardCollection: MemoryCardCollection
}

class SingletonMemoryCardCollection {
	private static _instance: SingletonMemoryCardCollection
	private mcc: MemoryCardCollection

	private constructor() {
		const deck = makeMemoryCards(16)
		// eslint-disable-next-line react-hooks/rules-of-hooks
		this.mcc = MemoryCardCollection.fromDeck(shuffle(deck))

		if (process.env.NODE_ENV === 'development') {
			// In development mode, use a global variable so that the value
			// is preserved across module reloads caused by HMR (Hot Module Replacement).
			global._MemoryCardCollection = this.mcc
		}
	}

	public static get instance() {
		if (!this._instance) {
			this._instance = new SingletonMemoryCardCollection()
		}
		return this._instance.mcc
	}
}

const CardsCollection = SingletonMemoryCardCollection.instance

export { CardsCollection }
