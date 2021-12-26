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
    purchasePrice: number;
    housePrice: number;
    rentPrice: number;
    house1Price: number;
    house2Price: number;
    house3Price: number;
    house4Price: number;
    hotelPrice: number;
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
}
interface UtilityDefinition extends BaseDefinition {
    type: "utility";
    id: UtilityTiles;
    purchasePrice: number;
    multipliers: number[];
}

interface CardDefinition extends BaseDefinition {
    type: "card";
    deck: "chance"|"communitybreast";
} 
interface MiscDefinition extends BaseDefinition {
    type: "misc";
}


interface BaseState {
    pID: PlayerID;
    rolls: Array<{dice1: number, dice2: number}>,
}

interface TransitionTurnState extends BaseState {
    type: "transition";
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
interface PayRentState extends BaseState {
    type: "payrent";
    property: PricedTiles;
    price: number;
}
interface UnOwnedState extends BaseState {
    type: "unowned";
    property: PurchasableTiles;
}

type TurnState = TransitionTurnState | StartTurnState | DiceRollState | PayRentState | UnOwnedState | EndTurnState; 