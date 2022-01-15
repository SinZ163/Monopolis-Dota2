/**
 * This file contains some general types related to your game that can be shared between
 * front-end (Panorama) and back-end (VScripts). Only put stuff in here you need to share.
 */

interface Color {
    r: number,
    g: number,
    b: number
}

interface UnitData {
    name: string,
    level: number
}

type Deck = "chance"|"communitybreast";

type HouseTiles = 
|    "brown1"
|    "brown2"

|    "teal1"
|    "teal2"
|    "teal3"

|    "magenta1"
|    "magenta2"
|    "magenta3"

|    "orange1"
|    "orange2"
|    "orange3"

|    "red1"
|    "red2"
|    "red3"

|    "yellow1"
|    "yellow2"
|    "yellow3"

|    "green1"
|    "green2"
|    "green3"

|    "blue1"
|    "blue2";

type RailroadTiles =
|    "railroad1"
|    "railroad2"
|    "railroad3"
|    "railroad4";

type UtilityTiles = 
|    "utility1"
|    "utility2";

type PurchasableTiles = 
|    HouseTiles
|    RailroadTiles
|    UtilityTiles;

type TaxTiles = 
|    "tax1"
|    "tax2";

type PricedTiles = 
| PurchasableTiles
| TaxTiles;

type Tiles = 
| PricedTiles
|    "chance1"
|    "chance2"
|    "chance3"
|    "communitybreast1"
|    "communitybreast2"
|    "communitybreast3"
|    "go"
|    "jail"
|    "freeparking"
|    "gotojail";


type SpaceDefinition = PropertyDefinition | TaxDefinition | RailroadDefinition | UtilityDefinition | CardDefinition | MiscDefinition;

interface BaseDefinition {
    index: number;
    id: Tiles;
}
interface PropertyDefinition extends BaseDefinition {
    type: "property";
    id: HouseTiles;
    category: string;
    purchasePrice: number;
    housePrice: number;
    rentPrice: number;
    house1Price: number;
    house2Price: number;
    house3Price: number;
    house4Price: number;
    hotelPrice: number;
    categoryId: number;
}
interface TaxDefinition extends BaseDefinition {
    type: "tax";
    id: TaxTiles;
    cost: number;
}
interface RailroadDefinition extends BaseDefinition {
    type: "railroad";
    id: RailroadTiles;
    purchasePrice: number;
    prices: number[];
    categoryId: number;
}
interface UtilityDefinition extends BaseDefinition {
    type: "utility";
    id: UtilityTiles;
    purchasePrice: number;
    multipliers: number[];
    categoryId: number;
}

interface CardDefinition extends BaseDefinition {
    type: "card";
    deck: Deck;
} 
interface MiscDefinition extends BaseDefinition {
    type: "misc";
}


interface BaseState {
    pID: PlayerID;
    rolls: Array<{dice1: number, dice2: number}>,
}
interface BankruptableState extends BaseState {
    potentialBankrupt: PlayerID;
}

interface TransitionTurnState extends BaseState {
    type: "transition";
}

interface JailedState extends BaseState {
    type: "jailed";
    indicators: Partial<Record<Tiles, number>>;
    preRolled: boolean;
}
interface StartTurnState extends BaseState {
    type: "start";
    indicators: Partial<Record<Tiles, number>>;
}
interface EndTurnState extends BaseState {
    type: "endturn";
}
interface DiceRollState extends BaseState {
    type: "diceroll";
    dice1: number;
    dice2: number;
}
interface PayRentState extends BankruptableState {
    type: "payrent";
    property: PricedTiles;
    price: number;
}
interface UnOwnedState extends BaseState {
    type: "unowned";
    property: PurchasableTiles;
}
interface AuctionTurnState extends BaseState {
    type: "auction";
    property: PurchasableTiles;
}

interface CardPendingState extends BaseState {
    type: "card_prompt",
    deck: Deck
}
interface CardResultState extends BankruptableState {
    type: "card_result",
    card: CardAction,
}

interface AuxRollPromptState extends BaseState {
    type: "auxroll_prompt",
    card: CardAction,
}
interface AuxRollResultState extends BankruptableState {
    type: "auxroll_result",
    card: CardAction,
    dice1: number,
    dice2: number,
    value: number
}

type TurnState = TransitionTurnState | JailedState | StartTurnState | DiceRollState | PayRentState | UnOwnedState | AuctionTurnState | EndTurnState | CardPendingState | CardResultState | AuxRollPromptState | AuxRollResultState;

interface BaseCardAction {
    text: string
}

interface TeleportCardAction extends BaseCardAction {
    type: "teleport",
    dest: Tiles,
}
interface TeleportCategoryCardAction extends BaseCardAction {
    type: "teleport_category",
    dest: "railroad" | "utility",
}
interface TeleportRelativeCardAction extends BaseCardAction {
    type: "teleport_relative",
    value: number
}

interface MoneyGainCardAction extends BaseCardAction {
    type: "money_gain",
    value: number,
}
interface MoneyGainOthersCardAction extends BaseCardAction {
    type: "money_gain_others",
    value: number,
}
interface MoneyLoseCardAction extends BaseCardAction {
    type: "money_lose",
    value: number,
}
interface MoneyLoseOthersCardAction extends BaseCardAction {
    type: "money_lose_others",
    value: number,
}

interface GOTOJailCardAction extends BaseCardAction {
    type: "jail"
}
interface FUCKJailCardAction extends BaseCardAction {
    type: "fuckjail"
}

interface RepairsCardAction extends BaseCardAction {
    type: "repairs",
    house: number,
    hotel: number,
}

type CardAction = TeleportCardAction | TeleportCategoryCardAction | TeleportRelativeCardAction | MoneyGainCardAction | MoneyLoseCardAction | MoneyGainOthersCardAction | MoneyLoseOthersCardAction | GOTOJailCardAction | FUCKJailCardAction | RepairsCardAction;

interface AuctionPlayerState {
    hasWithdrawn: boolean
}
interface AuctionState {
    current_bid: number,
    current_bidder: PlayerID,
    current_owner: PlayerID,
    
    playerStates: Partial<Record<PlayerID, AuctionPlayerState>>,    
    historical_bids: Array<{
        pID: PlayerID,
        amount: number
    }>
}

interface PropertyTradeOffer {
    type: "property";
    property: PurchasableTiles;
    from: PlayerID;
    to: PlayerID;
}
interface MoneyTradeOffer {
    type: "money";
    money: number;
    from: PlayerID;
    to: PlayerID;
}
type TradeOffers = PropertyTradeOffer | MoneyTradeOffer;
interface TradeState {
    initiator: PlayerID,
    current: PlayerID,
    participants: PlayerID[],
    offers: TradeOffers[],
    deltaMoney: Partial<Record<PlayerID, number>>,
    confirmations: Partial<Record<PlayerID, boolean>>,
    status: TradeStateStatus
}
declare const enum TradeStateStatus {
    ModifyTrade,
    Confirmation,
}