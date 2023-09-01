import type { GamesCollection, PlayersManager } from 'src/concepts'

declare module '@remix-run/cloudflare' {
	export interface AppLoadContext {
		playersManager: PlayersManager
		gamesCollection: GamesCollection
	}
}
