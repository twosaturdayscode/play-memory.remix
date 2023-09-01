import { logDevReady } from '@remix-run/cloudflare'
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '@remix-run/dev/server-build'
import { PlayersManager } from 'src/concepts'
import { GamesCollectionCloudKV } from 'src/services/games-collection/games-collection.cloudkv copy'
import { PlayersCollectionCloudKV } from 'src/services/players-collection/players-collection.cloudkv'

if (process.env.NODE_ENV === 'development') {
	logDevReady(build)
}

export const onRequest = createPagesFunctionHandler({
	build,
	getLoadContext: context => {
		const playersCollection = PlayersCollectionCloudKV.setup(
			context.env['players-kv'],
		)

		const gamesCollection = GamesCollectionCloudKV.setup(
			context.env['games-kv'],
		)

		return {
			env: context.env,
			playersManager: PlayersManager.summon(playersCollection),
			gamesCollection: gamesCollection,
		}
	},
	mode: process.env.NODE_ENV,
})
