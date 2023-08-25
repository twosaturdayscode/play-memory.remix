import { Dealer } from 'src/concepts'
import { CardsCollection } from './cards-collection.server'

// eslint-disable-next-line react-hooks/rules-of-hooks
export const dealer = Dealer.useCards(CardsCollection)
