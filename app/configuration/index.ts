import { GamesManager, PlayersManager } from 'src/concepts'
import { playersCollection } from './collections/players-collection.server'
import { gamesCollection } from './collections/games-collection.server'

export const playersManager = PlayersManager.summon(playersCollection)
export const gamesManager = GamesManager.summon(gamesCollection)
