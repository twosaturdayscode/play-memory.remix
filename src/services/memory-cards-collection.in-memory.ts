import type { MemoryCardsCollection, MemoryCard } from 'src/concepts'

export class MemoryCardsCollectionInMem implements MemoryCardsCollection {
	constructor(private cr: MemoryCard[]) {}

	static fromDeck(d: MemoryCard[]) {
		return new MemoryCardsCollectionInMem(d)
	}

	list() {
		return this.cr
	}

	find(id: string) {
		const crd = this.cr.find(c => c.id === id)

		if (!crd) throw Error(`No card with id: ${id}`)

		return crd
	}

	patch(id: string, patcher: (card: MemoryCard) => MemoryCard) {
		const index = this.cr.findIndex(c => c.id === id)

		if (index === -1) throw Error(`No card with id: ${id}`)

		this.cr[index] = patcher(this.cr[index])
	}
}
