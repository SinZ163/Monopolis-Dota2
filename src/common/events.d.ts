/**
 * This file contains types for the events you want to send between the UI (Panorama)
 * and the server (VScripts).
 * 
 * IMPORTANT: 
 * 
 * The dota engine will change the type of event data slightly when it is sent, so on the
 * Panorama side your event handlers will have to handle NetworkedData<EventType>, changes are:
 *   - Booleans are turned to 0 | 1
 *   - Arrays are automatically translated to objects when sending them as event. You have
 *     to change them back into arrays yourself! See 'toArray()' in src/panorama/hud.ts
 */

// To declare an event for use, add it to this table with the type of its data
interface CustomGameEventDeclarations {
    // Available in state start, auxroll_prompt
    monopolis_requestdiceroll: MonopolisEmptyEvent, //C-->S
    // Available in state payrent
    monopolis_requestpayrent: MonopolisEmptyEvent, //C-->S
    // Available in state unowned
    monopolis_requestauction: MonopolisEmptyEvent, //C-->S
    monopolis_requestpurchase: MonopolisEmptyEvent, //C-->S
    // Available in state card_prompt
    monopolis_requestcard: MonopolisEmptyEvent, //C-->S
    // Available in state card_result
    monopolis_acknowledgecard: MonopolisEmptyEvent,
    // Available in state endturn
    monopolis_endturn: MonopolisEmptyEvent, //C-->S
    monopolis_requestrenovation: MonopolisRenovationEvent,  //C-->S


    // Available in state auction
    monopolis_auctionbid: MonopolisAuctionBid, //C-->S
    monopolis_auctionwithdraw: MonopolisEmptyEvent, //C-->s
}

interface CustomNetTableDeclarations {
    property_ownership: Record<PurchasableTiles, PropertyOwnership>,
    player_state: Record<string, PlayerState>,
    misc: {
        current_turn: TurnState
        roll_order: Record<string, PlayerID>,
        housing_market: {
            houses: number,
            hotels: number,
        },
        price_definition: Record<Tiles,SpaceDefinition>,
        auction: AuctionState
    }
}


interface PropertyOwnership {
    houseCount: number;
    owner: PlayerID;
}

interface PlayerState {
    pID: PlayerID;
    money: number;
    location: number;
    jailed: number;
}


interface MonopolisEmptyEvent {}
interface MonopolisDiceRoll {
    dice1: number,
    dice2: number
}

interface MonopolisStartTurn {
    indicators: Partial<Record<Tiles, number>>;
}

interface MonopolisRenovationEvent {
    property: PurchasableTiles;
    houseCount: number;
}

interface MonopolisAuctionBid {
    amount: 10|50|100,
}