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

type PurchasableTiles = 
|    HouseTiles

|    "railroad1"
|    "railroad2"
|    "railroad3"
|    "railroad4"

|    "utility1"
|    "utility2";

type PricedTiles = 
| PurchasableTiles
|    "tax1"
|    "tax2";

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