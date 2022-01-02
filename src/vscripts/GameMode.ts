import { reloadable, toArray } from "./lib/tstl-utils";
import { modifier_gomoney } from "./modifiers/modifier_gomoney";
import { modifier_movetotile } from "./modifiers/modifier_movetotile";
import { modifier_vision } from "./modifiers/modifier_vision";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

const CardDeck: Record<"chance"|"communitybreast", CardAction[]> = {
    "chance": [
        {type: "teleport", dest: "go", text: "card_adv_go"},
        {type: "teleport", dest: "red3", text: "card_adv"},
        {type: "teleport", dest: "magenta1", text: "card_adv"},
        {type: "teleport_category", dest: "utility", text: "card_adv_utility"},
        {type: "teleport_category", dest: "railroad", text: "card_adv_railroad"}, // intentionally repeated
        {type: "teleport_category", dest: "railroad", text: "card_adv_railroad"},
        {type: "money_gain", value: 50, text: "CHANCE_BankDividend"},
        //{type: "fuckjail", text: "card_fuckjail_text"},
        {type: "teleport_relative", value: -3, text: "card_adv_relative_back"},
        {type: "jail", text: "card_jail_text"},
        //{type: "repairs", house: 25, hotel: 100, text: "CHANCE_GeneralRepairs"},
        {type: "money_lose", value: 15, text: "CHANCE_Speeding"},
        {type: "teleport", dest: "railroad1", text: "card_adv_railroad1"},
        {type: "teleport", dest: "blue2", text: "card_adv_blue2"},
        {type: "money_lose_others", value: 50, text: "CHANCE_Chairman"},
        {type: "money_gain", value: 150, text: "CHANCE_BuildingLoan"},
    ],
    "communitybreast": [
        {type: "teleport", dest: "go", text: "card_adv_go"},
        {type: "money_gain", value: 200, text: "COMMUNITYBREAST_BankError"},
        {type: "money_lose", value: 50, text: "COMMUNITYBREAST_Doctor"},
        {type: "money_gain", value: 50, text: "COMMUNITYBREAST_Stock"},
        //{type: "fuckjail", text: "card_fuckjail_text"},
        {type: "jail", text: "card_jail_text"},
        {type: "money_gain", value: 100, text: "COMMUNITYBREAST_HolidaySeason"},
        {type: "money_gain", value: 20, text: "COMMUNITYBREAST_Income"},
        {type: "money_gain_others", value: 10, text: "COMMUNITYBREAST_Birthday"},
        {type: "money_gain", value: 100, text: "COMMUNITYBREAST_LifeInsurance"},
        {type: "money_lose", value: 50, text: "COMMUNITYBREAST_Hospital"},
        {type: "money_lose", value: 50, text: "COMMUNITYBREAST_School"},
        {type: "money_gain", value: 25, text: "COMMUNITYBREAST_Consultancy"},
        //{type: "repairs", house: 40, hotel: 115, text: "COMMUNITYBREAST_StreetRepairs"},
        {type: "money_gain", value: 10, text: "COMMUNITYBREAST_Beauty"},
        {type: "money_gain", value: 100, text: "COMMUNITYBREAST_Inherit"},
    ],
};

const TilesObj: Record<Tiles,SpaceDefinition> = {
    go: {
        type: "misc",
        id: "go",
        index: 0
    },
    brown1: {
        type: "property",
        category: "brown",
        categoryId: 0,
        id: "brown1",
        index: 1,
        purchasePrice: 60,
        housePrice: 50,
        rentPrice: 2,
        house1Price: 10,
        house2Price: 30,
        house3Price: 90,
        house4Price: 160,
        hotelPrice: 250
    },
    communitybreast1: {
        type: "card",
        id: "communitybreast1",
        index: 2,
        deck: "communitybreast"
    },
    brown2: {
        type: "property",
        id: "brown2",
        category: "brown",
        categoryId: 0,
        index: 3,
        purchasePrice: 60,
        housePrice: 50,
        rentPrice: 4,
        house1Price: 20,
        house2Price: 60,
        house3Price: 180,
        house4Price: 320,
        hotelPrice: 450
    },
    tax1: {
        type: "tax",
        id: "tax1",
        index: 4,
        cost: 200
    },
    railroad1: {
        type: "railroad",
        id: "railroad1",
        categoryId: 9,
        index: 5,
        purchasePrice: 200,
        prices: [25, 50, 100, 200]
    },
    teal1: {
        type: "property",
        id: "teal1",
        category: "teal",
        categoryId: 1,
        index: 6,
        purchasePrice: 100,
        housePrice: 50,
        rentPrice: 6,
        house1Price: 30,
        house2Price: 90,
        house3Price: 270,
        house4Price: 400,
        hotelPrice: 550
    },
    chance1: {
        type: "card",
        id: "chance1",
        index: 7,
        deck: "chance"
    },
    teal2: {
        type: "property",
        id: "teal2",
        category: "teal",
        categoryId: 1,
        index: 8,
        purchasePrice: 100,
        housePrice: 50,
        rentPrice: 6,
        house1Price: 30,
        house2Price: 90,
        house3Price: 270,
        house4Price: 400,
        hotelPrice: 550
    },
    teal3: {
        type: "property",
        id: "teal3",
        category: "teal",
        categoryId: 1,
        index: 9,
        purchasePrice: 120,
        housePrice: 50,
        rentPrice: 8,
        house1Price: 40,
        house2Price: 100,
        house3Price: 300,
        house4Price: 450,
        hotelPrice: 600
    },
    jail: {
        type: "misc",
        id: "jail",
        index: 10
    },
    magenta1: {
        type: "property",
        id: "magenta1",
        category: "magenta",
        categoryId: 2,
        index: 11,
        purchasePrice: 140,
        housePrice: 100,
        rentPrice: 10,
        house1Price: 50,
        house2Price: 150,
        house3Price: 450,
        house4Price: 625,
        hotelPrice: 750
    },
    utility1: {
        type: "utility",
        id: "utility1",
        categoryId: 8,
        index: 12,
        purchasePrice: 150,
        multipliers: [4, 10]
    },
    magenta2: {
        type: "property",
        id: "magenta2",
        category: "magenta",
        categoryId: 2,
        index: 13,
        purchasePrice: 140,
        housePrice: 100,
        rentPrice: 10,
        house1Price: 50,
        house2Price: 150,
        house3Price: 450,
        house4Price: 625,
        hotelPrice: 750
    },
    magenta3: {
        type: "property",
        id: "magenta3",
        category: "magenta",
        categoryId: 2,
        index: 14,
        purchasePrice: 160,
        housePrice: 100,
        rentPrice: 12,
        house1Price: 60,
        house2Price: 180,
        house3Price: 500,
        house4Price: 700,
        hotelPrice: 900
    },
    railroad2: {
        type: "railroad",
        id: "railroad2",
        categoryId: 9,
        index: 15,
        purchasePrice: 200,
        prices: [25, 50, 100, 200]
    },
    orange1: {
        type: "property",
        id: "orange1",
        category: "orange",
        categoryId: 3,
        index: 16,
        purchasePrice: 180,
        housePrice: 100,
        rentPrice: 14,
        house1Price: 70,
        house2Price: 200,
        house3Price: 550,
        house4Price: 750,
        hotelPrice: 950
    },
    communitybreast2: {
        type: "card",
        id: "communitybreast2",
        index: 17,
        deck: "communitybreast"
    },
    orange2: {
        type: "property",
        id: "orange2",
        category: "orange",
        categoryId: 3,
        index: 18,
        purchasePrice: 180,
        housePrice: 100,
        rentPrice: 14,
        house1Price: 70,
        house2Price: 200,
        house3Price: 550,
        house4Price: 750,
        hotelPrice: 950
    },
    orange3: {
        type: "property",
        id: "orange3",
        category: "orange",
        categoryId: 3,
        index: 19,
        purchasePrice: 200,
        rentPrice: 16,
        housePrice: 100,
        house1Price: 80,
        house2Price: 220,
        house3Price: 600,
        house4Price: 800,
        hotelPrice: 1000
    },
    freeparking: {
        type: "misc",
        id: "freeparking",
        index: 20
    },
    red1: {
        type: "property",
        id: "red1",
        category: "red",
        categoryId: 4,
        index: 21,
        purchasePrice: 220,
        housePrice: 150,
        rentPrice: 18,
        house1Price: 90,
        house2Price: 250,
        house3Price: 700,
        house4Price: 875,
        hotelPrice: 1050
    },
    chance2: {
        type: "card",
        id: "chance2",
        index: 22,
        deck: "chance"
    },
    red2: {
        type: "property",
        id: "red2",
        category: "red",
        categoryId: 4,
        index: 23,
        purchasePrice: 220,
        housePrice: 150,
        rentPrice: 18,
        house1Price: 90,
        house2Price: 250,
        house3Price: 700,
        house4Price: 875,
        hotelPrice: 1050
    },
    red3: {
        type: "property",
        id: "red3",
        category: "red",
        categoryId: 4,
        index: 24,
        purchasePrice: 240,
        housePrice: 150,
        rentPrice: 20,
        house1Price: 100,
        house2Price: 300,
        house3Price: 750,
        house4Price: 925,
        hotelPrice: 1100
    },
    railroad3: {
        type: "railroad",
        id: "railroad3",
        categoryId: 9,
        index: 25,
        purchasePrice: 200,
        prices: [25, 50, 100, 200]
    },
    yellow1: {
        type: "property",
        id: "yellow1",
        category: "yellow",
        categoryId: 5,
        index: 26,
        purchasePrice: 260,
        housePrice: 150,
        rentPrice: 22,
        house1Price: 110,
        house2Price: 330,
        house3Price: 800,
        house4Price: 950,
        hotelPrice: 1150
    },
    yellow2: {
        type: "property",
        id: "yellow2",
        category: "yellow",
        categoryId: 5,
        index: 27,
        purchasePrice: 260,
        housePrice: 150,
        rentPrice: 22,
        house1Price: 110,
        house2Price: 330,
        house3Price: 800,
        house4Price: 950,
        hotelPrice: 1150
    },
    utility2: {
        type: "utility",
        id: "utility2",
        categoryId: 8,
        index: 28,
        purchasePrice: 150,
        multipliers: [4, 10]
    },
    yellow3: {
        type: "property",
        id: "yellow3",
        category: "yellow",
        categoryId: 5,
        index: 29,
        purchasePrice: 280,
        housePrice: 150,
        rentPrice: 24,
        house1Price: 120,
        house2Price: 360,
        house3Price: 850,
        house4Price: 1025,
        hotelPrice: 1200
    },
    gotojail: {
        type: "misc",
        id: "gotojail",
        index: 30
    },
    green1: {
        type: "property",
        id: "green1",
        category: "green",
        categoryId: 6,
        index: 31,
        purchasePrice: 300,
        housePrice: 200,
        rentPrice: 26,
        house1Price: 130,
        house2Price: 390,
        house3Price: 900,
        house4Price: 1100,
        hotelPrice: 1275
    },
    green2: {
        type: "property",
        id: "green2",
        category: "green",
        categoryId: 6,
        index: 32,
        purchasePrice: 300,
        housePrice: 200,
        rentPrice: 26,
        house1Price: 130,
        house2Price: 390,
        house3Price: 900,
        house4Price: 1100,
        hotelPrice: 1275
    },
    communitybreast3: {
        type: "card",
        id: "communitybreast3",
        index: 33,
        deck: "communitybreast"
    },
    green3: {
        type: "property",
        id: "green3",
        category: "green",
        categoryId: 6,
        index: 34,
        purchasePrice: 320,
        housePrice: 200,
        rentPrice: 28,
        house1Price: 150,
        house2Price: 450,
        house3Price: 1000,
        house4Price: 1200,
        hotelPrice: 1400
    },
    railroad4: {
        type: "railroad",
        id: "railroad4",
        categoryId: 9,
        index: 35,
        purchasePrice: 200,
        prices: [25, 50, 100, 200]
    },
    chance3: {
        type: "card",
        id: "chance3",
        index: 36,
        deck: "chance"
    },
    blue1: {
        type: "property",
        id: "blue1",
        category: "blue",
        categoryId: 7,
        index: 37,
        purchasePrice: 350,
        housePrice: 200,
        rentPrice: 35,
        house1Price: 175,
        house2Price: 500,
        house3Price: 1100,
        house4Price: 1300,
        hotelPrice: 1500
    },
    tax2: {
        type: "tax",
        id: "tax2",
        index: 38,
        cost: 100
    },
    blue2: {
        type: "property",
        id: "blue2",
        category: "blue",
        categoryId: 7,
        index: 39,
        purchasePrice: 400,
        housePrice: 200,
        rentPrice: 50,
        house1Price: 200,
        house2Price: 600,
        house3Price: 1400,
        house4Price: 1700,
        hotelPrice: 2000 
    }
};
const TilesReverseLookup: Record<number,Tiles> = Object.fromEntries(Object.entries(TilesObj).map<[number, Tiles]>(val => [val[1].index, val[0] as Tiles]));

interface GameState {
    players: PlayerState[];
    currentTurn: number;
}

const TeamColours: Partial<Record<DotaTeam, [number,number,number]>> = {
    [DotaTeam.CUSTOM_1]: [255, 0, 0],
    [DotaTeam.CUSTOM_2]: [0, 255, 0],
    [DotaTeam.CUSTOM_3]: [0, 0, 255],
    [DotaTeam.CUSTOM_4]: [0, 255, 255],
    [DotaTeam.CUSTOM_5]: [255, 0, 255],
    [DotaTeam.CUSTOM_6]: [255, 255, 0],
}

@reloadable
export class GameMode {

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource(
            "particle",
            "particles/customgames/capturepoints/cp_allied_fire.vpcf",
            context
        );
        PrecacheResource(
            "particle",
            "particles/customgames/capturepoints/cp_allied_metal.vpcf",
            context
        );
        PrecacheResource(
            "soundfile",
            "sounds/items/item_handofmidas.vsnd",
            context
        );
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    private currentDecks: Record<"chance"|"communitybreast", CardAction[]> = {
        chance: [...CardDeck.chance],
        communitybreast: [...CardDeck.communitybreast],
    }

    constructor() {
        this.configure();
        ListenToGameEvent(
            "game_rules_state_change",
            () => this.OnStateChange(),
            undefined
        );
        CustomGameEventManager.RegisterListener("monopolis_endturn", (user, event) => this.EndTurn(user, event));
        CustomGameEventManager.RegisterListener("monopolis_requestdiceroll", (user, event) => this.RollDice(user, event));
        CustomGameEventManager.RegisterListener("monopolis_requestpurchase", (user, event) => this.PurchaseProperty(user, event));
        CustomGameEventManager.RegisterListener("monopolis_requestrenovation", (user, event) => this.ApplyRenovation(user, event));
        CustomGameEventManager.RegisterListener("monopolis_requestpayrent", (user, event) => this.PayRent(user, event));
        CustomGameEventManager.RegisterListener("monopolis_requestauction", (user, event) => this.StartAuction(user, event));
        CustomGameEventManager.RegisterListener("monopolis_requestcard", (user, event) => this.DrawCard(user, event));
        CustomGameEventManager.RegisterListener("monopolis_acknowledgecard", (user, event) => this.AcknowledgeCard(user, event));
        CustomGameEventManager.RegisterListener("monopolis_auctionbid", (user, event) => this.AuctionBid(user, event));
        CustomGameEventManager.RegisterListener("monopolis_auctionwithdraw", (user, event) => this.AuctionWithdraw(user, event));
    }
    GetAuctionState(): AuctionState {
        let auctionState = CustomNetTables.GetTableValue("misc", "auction");
        let newPlayerStates: Partial<Record<PlayerID, AuctionPlayerState>> = {};
        for (let [pID,player] of Object.entries(auctionState.playerStates)) {
            newPlayerStates[tonumber(pID) as PlayerID] = {
                hasWithdrawn: player.hasWithdrawn === 1,
            }
        }
        return {
            current_bid: auctionState.current_bid,
            current_bidder: auctionState.current_bidder,
            current_owner: auctionState.current_owner,
            historical_bids: toArray(auctionState.historical_bids),
            playerStates: newPlayerStates
        }
    }
    AdvanceAuctionTurn(auctionState: AuctionState) {
        let rollOrder = CustomNetTables.GetTableValue("misc", "roll_order");
        do {
            let currentIndex = Object.values(rollOrder).find(pID => auctionState.current_bidder === pID);
            if (!currentIndex) { 
                throw "Can't find the index :(";
            }
            auctionState.current_bidder = rollOrder[tostring((currentIndex + 1) % Object.keys(rollOrder).length)];
        } while(auctionState.playerStates[auctionState.current_bidder]!.hasWithdrawn);
        CustomNetTables.SetTableValue("misc", "auction", auctionState);
    }
    AuctionWithdraw(user: EntityIndex, event: { PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        DeepPrintTable(current);
        if (current.turnState.type !== "auction") return;
        let auctionState = this.GetAuctionState();
        DeepPrintTable(auctionState);
        if (!IsInToolsMode() && auctionState.current_bidder !== event.PlayerID) return;
        print("Lets play?");
        let playerState = auctionState.playerStates[auctionState.current_bidder];
        if (!playerState) {
            print("wtf?");
            return;
        }
        playerState.hasWithdrawn = true;

        let allWithdrawn = true;
        for (let player of Object.values(auctionState.playerStates)) {
            if (!player.hasWithdrawn) {
                allWithdrawn = false;
                break;
            }
        }
        if (allWithdrawn) {
            print("All withdrawn");
            // TODO: End auction 
            if (auctionState.current_owner === -1) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_auction_failed"});
            } else {
                let bidder = CustomNetTables.GetTableValue("player_state", tostring(auctionState.current_owner));
                bidder.money -= auctionState.current_bid;
                let property = CustomNetTables.GetTableValue("property_ownership", current.turnState.property);
                property.owner = auctionState.current_owner;
                CustomNetTables.SetTableValue("property_ownership", current.turnState.property, property);
                this.SavePlayer(bidder);
            }
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
        } else {
            this.AdvanceAuctionTurn(auctionState);
        }
    }
    AuctionBid(user: EntityIndex, event: { amount: 10 | 50 | 100; PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        if (current.turnState.type !== "auction") return;
        let auctionState = this.GetAuctionState();
        if (!IsInToolsMode() && auctionState.current_bidder !== event.PlayerID) return;
        if ((event.amount + auctionState.current_bid) > current.money) {
            FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_auction_broke" });
            return;
        }
        auctionState.historical_bids.push({
            amount: event.amount,
            pID: auctionState.current_bidder,
        });
        auctionState.current_bid += event.amount;
        auctionState.current_owner = auctionState.current_bidder;
        this.AdvanceAuctionTurn(auctionState);
    }
    AcknowledgeCard(user: EntityIndex, event: { PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}
        if (current.turnState.type === "auxroll_result") {
            // TODO: Handle bankrupt scenario
            current.money -= current.turnState.value;
            let tile = TilesReverseLookup[current.location];
            tile
            let propertyOwnership = CustomNetTables.GetTableValue("property_ownership", TilesReverseLookup[current.location] as PurchasableTiles);
            let owner = CustomNetTables.GetTableValue("player_state", tostring(propertyOwnership.owner));
            owner.money += current.turnState.value;
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
            this.SavePlayer(current);
            this.SavePlayer(owner);
            return;
        }
        if (current.turnState.type !== "card_result") {return;}
        let card = current.turnState.card;
        switch(card.type) {
            case "jail":
                this.GotoJail();
                return;
            case "money_gain":
                current.money += card.value;
                this.SavePlayer(current);
                break;
            case "money_gain_others":
                let playerCountGain = 0;
                for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
                    if (i === current.pID) continue;
                    if (PlayerResource.IsValidPlayer(i)) {
                        let playerState = CustomNetTables.GetTableValue("player_state", tostring(i));
                        // TODO: Handle bankrupt scenario
                        // TODO handle players already dead
                        playerState.money -= card.value;
                        this.SavePlayer(playerState);
                        playerCountGain++;
                    }
                }
                current.money += (card.value * playerCountGain);
                this.SavePlayer(current);
                break;
            case "money_lose":
                current.money -= card.value;
                this.SavePlayer(current);
                break;
            case "money_lose_others":
                let playerCountLose = 0;
                for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
                    if (i === current.pID) continue;
                    if (PlayerResource.IsValidPlayer(i)) {
                        let playerState = CustomNetTables.GetTableValue("player_state", tostring(i));
                        // TODO handle players already dead
                        playerState.money += card.value;
                        this.SavePlayer(playerState);
                        playerCountLose++;
                    }
                }
                // TODO: Handle bankrupt scenario
                current.money -= (card.value * playerCountLose);
                this.SavePlayer(current);
                break;
            case "repairs":
                print("Fuck repairs");
                break;
            case "teleport":
                this.MoveForwardToLocation(TilesObj[card.dest].index);
                return;
            case "teleport_category":
                let destinations = Object.values(TilesObj).filter(row => row.type === (card as TeleportCategoryCardAction).dest);
                destinations.sort((a,b) => a.index - b.index);
                let dest = destinations[0];
                for (let destination of destinations) {
                    if (current.location < destination.index) {
                        dest = destination;
                        break;
                    }
                }
                this.MoveForwardToLocation(dest.index);
                return;
            case "teleport_relative":
                if (card.value >= 0)
                    this.MoveForwardToLocation(current.location + card.value);
                else
                    this.MoveBackwardToLocation(current.location + card.value);
                return;
        }
        CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
    }
    DrawCard(user: EntityIndex, event: { PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}
        if (current.turnState.type !== "card_prompt") {return;}
        let card = this.currentDecks[current.turnState.deck].shift();
        if (!card)  {
            print("Why is the deck empty");
            return;
        }
        if (card.type !== "fuckjail") {
            this.currentDecks[current.turnState.deck].push(card);
        } else {
            // TODO: Work out how we are going to keep it
        }
        CustomNetTables.SetTableValue("misc", "current_turn", {type: "card_result", pID: current.pID, rolls: current.turnState.rolls, card});
    }
    ApplyRenovation(user: EntityIndex, event: { property: PurchasableTiles; houseCount: number; PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}

        let tile = TilesObj[event.property] as (RailroadDefinition | UtilityDefinition | PropertyDefinition);
        let propertyState = CustomNetTables.GetTableValue("property_ownership", tile.id);

        // Asserts its ownable and if it is, its the current player
        if (propertyState?.owner !== current.pID) { return; }

        let commonLogicUsed = false;
        if (propertyState.houseCount === 0 && event.houseCount === -1) {
            // 0 => -1, we are mortgaging
            current.money += tile.purchasePrice / 2;
            propertyState.houseCount = -1;
            commonLogicUsed = true;
        } else if (propertyState.houseCount === -1 && event.houseCount === 0) {
            // -1 => 0, we are unmortgaging and should take the money + 10% fee
            let cost = (tile.purchasePrice / 2) * 1.10;
            if (current.money < cost) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_broke" });
                return;
            }
            current.money -= cost;
            propertyState.houseCount = 0;
            commonLogicUsed = true;
        }

        if (tile.type === "property") {
            let properties = Object.values(TilesObj).filter(row => row.type === "property" && row.category === (tile as PropertyDefinition).category) as PropertyDefinition[];
            let owners = properties.map(row => [row, CustomNetTables.GetTableValue("property_ownership", row.id)]) as [PropertyDefinition, PropertyOwnership][];
            let isMonopoly = true;
            let minHouseCount = math.huge;
            let maxHouseCount = -1 * math.huge;
            for (let owner of owners) {
                if (owner[1].owner !== propertyState.owner) {
                    isMonopoly = false;
                } else {
                    if (owner[1].houseCount < minHouseCount) {
                        minHouseCount = owner[1].houseCount;
                    }
                    if (owner[1].houseCount > maxHouseCount) {
                        maxHouseCount = owner[1].houseCount;
                    }
                }
            }
            let currentDelta = maxHouseCount - minHouseCount;
            if (currentDelta > 1) {
                print("Wait what, this is illegal.");
                return;
            }
            
            let delta = event.houseCount - propertyState.houseCount;
            // Bound houseCount to legal values
            if (event.houseCount > 5 || event.houseCount < -1) {
                print("Illegal");
                return;
            }
            // Only allow increments of 1 or -1, OR -5
            // TODO: Reconsider this when I allow "blueprint mode" property management
            if (Math.abs(delta) > 1 && delta !== -5) {
                print("Illegal");
                return;
            }
            if (currentDelta > 0 && (event.houseCount > maxHouseCount || event.houseCount < minHouseCount)) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_buildevenly" });
                return;
            }
            // If you don't have the monopoly fuck off
            if (event.houseCount > 0 && !isMonopoly) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_needmonopoly" });
                return;
            }
            let market = CustomNetTables.GetTableValue("misc", "housing_market");
            
            DeepPrintTable({propertyState, event, delta, market, tile});
            if (propertyState.houseCount === 0 && event.houseCount === -1) {
                current.money += tile.purchasePrice / 2;
                propertyState.houseCount = -1;
            } else if (propertyState.houseCount === -1 && event.houseCount === 0) {
                // -1 => 0, we are unmortgaging and should take the money + 10% fee
                // TODO: Error if the user is poor
                current.money -= (tile.purchasePrice / 2) * 1.10;
                propertyState.houseCount = 0;
            }
            // If you want houses and aren't going to a hotel, needs to have houses in the market
            else if (event.houseCount != 5 && delta > 0 && market.houses < delta) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_marketcrash" });
                return;
            }
            // If you want a hotel, need a hotel in the market
            if (event.houseCount === 5 && delta > 0 && market.hotels < 1) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_marketcrash" });
                return;
            }
            // If you are only removing the hotel and replacing with 4 houses, 4 houses need to be in the market
            if (delta === -1 && propertyState.houseCount === 5 && market.houses < 4) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_marketcrash" });
                return;
            }
            // if you want a house/hotel and are poor, go away
            if (delta > 0 && current.money < tile.housePrice) {
                FireGameEvent("dota_hud_error_message", { reason: 80, message: "#monopolis_property_broke" });
                return;
            }
            // Sell the hotel and not put houses back on
            if (delta === -5 && propertyState.houseCount === 5) {
                market.hotels -= 1;
                propertyState.houseCount = 0;
                current.money += (tile.housePrice / 2) * 5;
            }
            // Buy a hotel (hotels are on the market, delta must be 1 and can afford it)
            else if (event.houseCount === 5 && delta > 0) {
                propertyState.houseCount = 5;
                market.hotels -= 1;
                market.houses += 4;
                current.money -= tile.housePrice;
            }
            // Buy a house (cant be hotel, houses are on the market, delta must be 1 and can afford it)
            else if (event.houseCount > 0 && propertyState.houseCount !== -1 && delta > 0) {
                propertyState.houseCount += delta;
                market.houses -= delta;
                current.money -= tile.housePrice;
            }
            // Sell a house/hotel
            else if (delta < 0 && event.houseCount !== -1) {
                if (propertyState.houseCount === 5) {
                    market.houses -= (5 + delta);
                    market.hotels += 1;
                } else {
                    market.houses += delta;
                }
                propertyState.houseCount += delta;
                current.money += (tile.housePrice / 2) * Math.abs(delta);
            } else if (commonLogicUsed) {}
            // 0 => -1, we are mortgaging and need to grant money
            else {
                print("Wait how did it make it this far");
                return;
            }
            
            CustomNetTables.SetTableValue("misc", "housing_market", market);
        }
        
        CustomNetTables.SetTableValue("property_ownership", tile.id, propertyState);
        this.SavePlayer(current);
        print("Saving the market, current property and player?");
    }
    StartAuction(user: EntityIndex, event: { PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}
        if (current.turnState.type !== "unowned") {return;}

        CustomNetTables.SetTableValue("misc", "current_turn", {type: "auction", pID: current.pID, rolls: current.turnState.rolls, property: current.turnState.property});
        let playerStates: Partial<Record<PlayerID, AuctionPlayerState>> = {};
        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            if (PlayerResource.IsValidPlayer(i)) {
                playerStates[i] = {hasWithdrawn: false}
            }
        }
        CustomNetTables.SetTableValue("misc", "auction", {
            current_bid: 0,
            current_owner: -1,
            current_bidder: current.pID,
            historical_bids: [],
            playerStates,
        });
        return;
    }
    PayRent(user: EntityIndex, event: { PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        print("Roll Dice", current.pID);
        DeepPrintTable(current);

        // Anti Cheat, its just this simple
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}

        let turnState = CustomNetTables.GetTableValue("misc", "current_turn");
        
        if (turnState.type === "jailed") {
            // TODO tell client they cant go negative
            current.money -= 50;
            this.SavePlayer(current);
            this.LeaveJail();
            current = this.GetCurrentPlayerState();
            if (turnState.preRolled === 1) {
                let diceRoll = toArray(turnState.rolls).pop();
                if (!diceRoll) throw new Error("Why is there no dice roll?");
                CustomNetTables.SetTableValue("misc", "current_turn", {type: "diceroll", dice1: diceRoll.dice1, dice2: diceRoll.dice2, pID: current.pID, rolls: current.turnState.rolls});
                this.MoveForwardToLocation((current.location + diceRoll.dice1 + diceRoll.dice2) % 40);
            } else {
                this.StartTurn();
            }
            return;
        }

        // this event is only available in payrent state
        if (turnState.type !== "payrent") return;

        let tile = TilesObj[turnState.property];
        // need this check because it may be tax which has no owner
        if (this.IsPurchasableTile(tile)) {
            let propertyState = CustomNetTables.GetTableValue("property_ownership", tile.id);
            let owner = CustomNetTables.GetTableValue("player_state", tostring(propertyState.owner));
            owner.money += turnState.price;
            this.SavePlayer(owner);
        }
        // TODO tell client they cant go negative
        current.money -= turnState.price;
        this.SavePlayer(current);
        CustomNetTables.SetTableValue("misc", "current_turn", {pID: current.pID, rolls: current.turnState.rolls, type: "endturn"});
    }
    PurchaseProperty(user: EntityIndex, event: { PlayerID: PlayerID; }): void {
        let current = this.GetCurrentPlayerState();
        print("Roll Dice", current.pID);

        // Anti Cheat, its just this simple
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}

        let turnState = CustomNetTables.GetTableValue("misc", "current_turn");

        // this event is only available in payrent state
        if (turnState.type !== "unowned") return;

        let tile = TilesObj[turnState.property];
        let propertyState = CustomNetTables.GetTableValue("property_ownership", turnState.property);
        if (!this.IsPurchasableTile(tile)) return;
        current.money -= tile.purchasePrice;
        propertyState.owner = current.pID;
        this.SavePlayer(current);
        CustomNetTables.SetTableValue("property_ownership", tile.id, propertyState);
        CustomNetTables.SetTableValue("misc", "current_turn", {pID: current.pID, rolls: current.turnState.rolls, type: "endturn"});
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 0);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 0);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.CUSTOM_1, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.CUSTOM_2, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.CUSTOM_3, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.CUSTOM_4, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.CUSTOM_5, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.CUSTOM_6, 1);

        for (let [k,v] of Object.entries(TeamColours)) {
            SetTeamCustomHealthbarColor(tonumber(k) as DotaTeam, v[0], v[1], v[2]);
        }
        GameRules.GetGameModeEntity().SetCustomHeroMaxLevel(math.huge);
        // GameRules.GetGameModeEntity().SetFreeCourierModeEnabled(true);

        GameRules.SetShowcaseTime(0);
        GameRules.SetStrategyTime(0);
        
        GameRules.SetHeroSelectionTime(heroSelectionTime);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            PlayerResource.GetPlayer(0)?.SetTeam(DotaTeam.CUSTOM_1);
            SendToServerConsole("dota_bot_populate");
        }

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(1, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }
        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(5, () => this.StartGame());

            print("We are in pregame now!");
        }
    }

    public IsPurchasableTile(tile: SpaceDefinition): tile is PropertyDefinition | RailroadDefinition | UtilityDefinition {
        switch(tile.type) {
            case "property":
            case "railroad":
            case "utility":
                return true;
        }
        return false;
    }

    private StartGame(): void {
        print("Game starting!");
        CustomNetTables.SetTableValue("misc", "price_definition", TilesObj);
        CustomNetTables.SetTableValue("misc", "housing_market", {houses: 32, hotels: 12});
        this.currentDecks = {
            chance: ShuffleArray([...CardDeck.chance]),
            communitybreast: ShuffleArray([...CardDeck.communitybreast]),
        }

        let go = Entities.FindByName(undefined,"go");
        if (!go) {
            print("Warning: GO isn't on the map, this will fail.");
            return;
        }

        for (let tile of Object.values(TilesObj)) {
            if (this.IsPurchasableTile(tile)) {
                CustomNetTables.SetTableValue("property_ownership", tile.id, {
                    houseCount: 0,
                    owner: -1,
                });
            }
        }
        CustomNetTables.SetTableValue("misc", "current_turn", {pID: 0, rolls: [], type: "transition"});

        
        // TODO: Do logic to determine roll order
        let rollOrder: Record<string, PlayerID> = {};
        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            if (PlayerResource.IsValidPlayer(i)) {
                print(`${i} is a valid player?`);
                let player = PlayerResource.GetPlayer(i);
                if (!player) break;
                rollOrder[i] = i;

                let colour = TeamColours[player.GetTeam()];
                if (colour) {
                    PlayerResource.SetCustomPlayerColor(i, colour[0], colour[1], colour[2]);
                }
                let hero = player?.GetAssignedHero();

                if (hero) {
                    hero.AddNewModifier(hero, undefined, modifier_vision.name, {
                        duration: -1,
                    });
                    FindClearSpaceForUnit(
                        hero,
                        (go.GetAbsOrigin() +
                            Vector(600, i * 100 + 50, 0)) as Vector,
                        true
                    );
                } else {
                    print("Why is there no hero?");
                    print(player, hero);
                }

                CustomNetTables.SetTableValue("player_state", tostring(i), {
                    pID: i,
                    money: 1500,
                    location: 0,
                    jailed: 0
                });
            }
        }
        CustomNetTables.SetTableValue("misc", "roll_order", rollOrder);
        this.StartTurn();
    }

    public GetCurrentPlayerState() {
        const turnState = CustomNetTables.GetTableValue("misc", "current_turn");
        const playerState = CustomNetTables.GetTableValue("player_state", tostring(turnState.pID));
        let out = {...playerState, turnState: {...turnState, rolls: toArray(turnState.rolls)}};
        if (out.turnState.type === "jailed") {
            (out.turnState as any).preRolled = out.turnState.preRolled === 1
        }
        return out as PlayerState & {turnState: TurnState};
    }

    public GetStartLocationOfTile(tileId: number) {
        let tile = Entities.FindByName(undefined, TilesReverseLookup[tileId]);
        if (!tile) {
            error("Tile not found");
        }
        let middleVector = Vector(0, 0, 0);
        if (tileId < 10) {
            middleVector = Vector(200, 500, 0);
        } else if (tileId < 20) {
            middleVector = Vector(500, -200, 0);
        } else if (tileId < 30) {
            middleVector = Vector(-200, -500, 0);
        } else {
            middleVector = Vector(-500, 200);
        }
        return (tile.GetAbsOrigin() + middleVector) as Vector;
    }
    public SavePlayer(player: PlayerState & {turnState?: TurnState}) {
        let newPlayer = {...player};
        delete newPlayer.turnState;
        CustomNetTables.SetTableValue("player_state", tostring(player.pID), player);
    }

    public GotoJail() {
        let current = this.GetCurrentPlayerState();
        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();
        ExecuteOrderFromTable({OrderType: UnitOrder.STOP, UnitIndex: currentPlayer.GetEntityIndex(), Queue: false});
        // TODO: Make teleport pretty
        FindClearSpaceForUnit(currentHero, Vector(0,0,500), true);
        CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
        current.jailed = 3;
        current.location = -1;
        this.SavePlayer(current);
    }
    public LeaveJail() {
        let current = this.GetCurrentPlayerState();
        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();
        let pos = this.GetStartLocationOfTile(10);
        // TODO: Make teleport pretty
        FindClearSpaceForUnit(currentHero, (pos + Vector(0,0,500)) as Vector, true);
        current.jailed = 0;
        current.location = 10;
        this.SavePlayer(current);
    }

    public StartTurn(preRolled = false) {
        let current = this.GetCurrentPlayerState();
        print("Turn Start", current.pID);

        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        print(current.jailed);
        if (preRolled || current.jailed > 0) {
            let indicators: Partial<Record<Tiles, number>> = {};
            for (let i = 1; i <= 12; i++) {
                if (i % 2 === 1 && current.jailed > 1) continue;
                let indicatorSpot = (10 + i) % 40;
                indicators[TilesReverseLookup[indicatorSpot]] = i;
            }
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "jailed", pID: current.pID, rolls: current.turnState.rolls, indicators, preRolled});
        } else {
            let currentHero = currentPlayer.GetAssignedHero();
    
            currentHero.MoveToPosition(this.GetStartLocationOfTile(current.location));
    
            let indicators: Partial<Record<Tiles, number>> = {};
            for (let i = 1; i <= 12; i++) {
                let indicatorSpot = (current.location + i) % 40;
                indicators[TilesReverseLookup[indicatorSpot]] = i;
            }
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "start", pID: current.pID, rolls: current.turnState.rolls, indicators});
        }
    }
    public RollDice(userId: EntityIndex, event: { PlayerID: PlayerID}) {
        let current = this.GetCurrentPlayerState();
        print("Roll Dice", current.pID);
        DeepPrintTable(current);

        // Anti Cheat, its just this simple
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}

        let dice1 = RandomInt(1, 6);
        let dice2 = RandomInt(1, 6);
        //let dice1 = 10;
        //let dice2 = 12;
        if (current.turnState.type === "auxroll_prompt") {
            // TODO: Make more generic
            let value = 10 * (dice1 + dice2);
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "auxroll_result", pID: current.pID, rolls: current.turnState.rolls, card: current.turnState.card, dice1, dice2, value})
            return;
        }
        current.turnState.rolls = [...current.turnState.rolls, {dice1,dice2}];

        // We are in jail and did NOT get doubles :(
        if (current.jailed > 0 && dice1 !== dice2) {
            current.jailed--;
            this.SavePlayer(current);
            if (current.jailed === 0) {
                CustomNetTables.SetTableValue("misc", "current_turn", current.turnState);
                this.StartTurn(true);
            } else {
                CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
            }
            return;
        } else if (current.jailed > 0) {
            this.LeaveJail();
            let oldRolls = current.turnState.rolls;
            current = this.GetCurrentPlayerState();
            current.turnState.rolls = oldRolls;
            // cheesy logic to make sure its not treated as a double later on
            current.turnState.rolls.push({dice1: 1, dice2: -1});
        }
        let turnState: TurnState = {
            pID: current.pID,
            type: "diceroll",
            rolls: current.turnState.rolls,
            dice1,
            dice2,
        }
        CustomNetTables.SetTableValue("misc", "current_turn", turnState);

        if (dice1 === dice2 && turnState.rolls.length >= 3) {
            this.GotoJail();
            return;
        } else {
            let futureLocation = (current.location + dice1 + dice2) % 40;
            print(current.location, dice1, dice2, futureLocation);
            this.SavePlayer(current);
            this.MoveForwardToLocation(futureLocation);
        }
    }
    public MoveBackwardToLocation(futureLocation: number) {
        if (futureLocation < 0) {
            futureLocation = 40 + futureLocation;
        }
        return this.MoveForwardToLocation(futureLocation, true);
    }
    public MoveForwardToLocation(futureLocation: number, backwards = false) {
        let current = this.GetCurrentPlayerState();
        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();

        if (current.location > futureLocation && !backwards) {
            print("We are spawning go??");
            let pos = this.GetStartLocationOfTile(0);
            CreateModifierThinker(currentHero, undefined, modifier_gomoney.name, { duration: -1}, pos, currentHero.GetTeam(), false);
        }

        let position = this.GetStartLocationOfTile(current.location);
        do {
            let futureSide = math.floor(futureLocation / 10);
            let currentSide = math.floor(current.location / 10);
            // when going backwards, we need to treat corners as the previous side, not same side
            if (backwards) {
                futureSide = math.floor((futureLocation - 1) / 10); // 19 - 1 = 18 / 10 = 1
                currentSide = math.floor((current.location - 1) / 10); // 21 - 1 = 20 / 10 = 2
            }

            let currentDelta = current.location % 10;
            if (backwards && currentDelta === 0) {
                currentDelta = 10;
            }
            let futureDelta = futureLocation % 10;

            let rowAmount: number;
            if (currentSide === futureSide) {
                rowAmount = futureDelta - currentDelta;
            } else if (backwards) {
                    rowAmount = -currentDelta;
            } else {
                rowAmount = 10 - currentDelta;
            }

            DeepPrintTable({futureSide, currentSide, currentDelta, futureDelta, rowAmount});
            let sameSideVector: Vector;
            if (currentSide === 0) {
                sameSideVector = Vector(rowAmount * -400, 0, 0);
            } else if (currentSide === 1) {
                sameSideVector = Vector(0, rowAmount * 400, 0);
            } else if (currentSide === 2) {
                sameSideVector = Vector(rowAmount * 400, 0, 0);
            } else {
                sameSideVector = Vector(0, rowAmount * -400, 0);
            }
            position = (position + sameSideVector) as Vector;
            ExecuteOrderFromTable({
                OrderType: UnitOrder.MOVE_TO_POSITION,
                UnitIndex: currentHero.GetEntityIndex(),
                Position: position,
                Queue: true,
            });
            current.location = (current.location + rowAmount) % 40;
            print(current.location, futureLocation);
        } while (current.location !== futureLocation);
        this.SavePlayer(current);
        let futureTile = Entities.FindByName(undefined, TilesReverseLookup[futureLocation]);
        if (!futureTile) {
            print("Warning: future location tile is missing? wtf");
            return;
        }
        CreateModifierThinker(currentHero, undefined, modifier_movetotile.name, { duration: -1}, position, currentHero.GetTeam(), false);
    }
    public FoundHeroForGold() {
        let current = this.GetCurrentPlayerState();
        current.money += 200;
        let hero = PlayerResource.GetPlayer(current.pID)?.GetAssignedHero();
        hero?.HeroLevelUp(true);
        this.SavePlayer(current);
    }
    public FoundHero() {
        let current = this.GetCurrentPlayerState();
        let property = TilesReverseLookup[current.location];
        let tile = TilesObj[property];
        print("Found hero");
        DeepPrintTable(current);
        print(property);
        if (this.IsPurchasableTile(tile)) {
            let propertyState = CustomNetTables.GetTableValue("property_ownership", tile.id);
            // Owned property that isn't current player and it isn't mortgaged (-1)
            if (propertyState.owner > -1 && propertyState.owner !== current.pID && propertyState.houseCount >= 0) {
                print("Well you need to pay up now");
                const price = this.CalculateRent(tile, current, propertyState);
                DeepPrintTable({price, current, a:Number.isNaN(price)});
                if (Number.isNaN(price) && current.turnState.type === "card_result") {
                    CustomNetTables.SetTableValue("misc", "current_turn", {pID: current.pID, type: "auxroll_prompt", rolls: current.turnState.rolls, card: current.turnState.card});
                } else {
                    CustomNetTables.SetTableValue("misc", "current_turn", {pID: current.pID, type: "payrent", rolls: current.turnState.rolls, property: tile.id, price});
                }
            }
            else if (propertyState.owner === -1) {
                CustomNetTables.SetTableValue("misc", "current_turn", {pID: current.pID, type: "unowned", rolls: current.turnState.rolls, property: tile.id});
            } else {
                // owner exists but either current player owns it or its mortgaged. skip to endturn state
                CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
            }
        } else if (tile.type === "tax") {
            CustomNetTables.SetTableValue("misc", "current_turn", {pID: current.pID, type: "payrent", rolls: current.turnState.rolls, property: tile.id, price: tile.cost});
        } else if (tile.type === "card") {
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "card_prompt", pID: current.pID, rolls: current.turnState.rolls, deck: tile.deck});
        } else if (tile.id === "gotojail") {
            this.GotoJail();
        } else {
            // TODO: implement chance/communitybreast/etc
            CustomNetTables.SetTableValue("player_state", tostring(current.pID), current);
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "endturn", pID: current.pID, rolls: current.turnState.rolls});
        }
    }

    public CalculateRent(tile: PropertyDefinition | UtilityDefinition | RailroadDefinition, current: PlayerState, propertyState: PropertyOwnership): number {
        DeepPrintTable({tile, current, propertyState});
        let turnState = CustomNetTables.GetTableValue("misc", "current_turn");
        if (propertyState.houseCount === -1) { 
            return 0;
        }
        if (tile.type === "property") {
            let properties = Object.values(TilesObj).filter(row => row.type === "property" && row.category === tile.category) as PropertyDefinition[];
            let owners = properties.map(row => [row, CustomNetTables.GetTableValue("property_ownership", row.id)]) as [PropertyDefinition, PropertyOwnership][];
            DeepPrintTable(owners);
            let isMonopoly = true;
            for (let owner of owners) {
                if (owner[1].owner !== propertyState.owner) {
                    print(owner);
                    isMonopoly = false;
                    break;
                }
            }
            print(isMonopoly);
            if (isMonopoly) {
                switch(propertyState.houseCount) {
                    case 5:
                        return tile.hotelPrice;
                    case 4:
                        return tile.house4Price;
                    case 3:
                        return tile.house3Price;
                    case 2:
                        return tile.house2Price;
                    case 1:
                        return tile.house1Price;
                    case 0:
                        return tile.rentPrice * 2;
                }
            }
            return tile.rentPrice;
        }
        else if (tile.type === "railroad") {
            let railroads = [
                CustomNetTables.GetTableValue("property_ownership", "railroad1"),
                CustomNetTables.GetTableValue("property_ownership", "railroad2"),
                CustomNetTables.GetTableValue("property_ownership", "railroad3"),
                CustomNetTables.GetTableValue("property_ownership", "railroad4")
            ];
            let ownedRailroads = railroads.filter(railroad => railroad.owner === propertyState.owner).length;
            let price = tile.prices[ownedRailroads - 1];
            if (turnState.type === "card_result" && turnState.card.type === "teleport_category") {
                return price * 2;
            }
            return price;
        } else {
            DeepPrintTable({turnState});
            if (turnState.type === "diceroll") {
                let diceSum = turnState.dice1 + turnState.dice2;
                let railroads = [
                    CustomNetTables.GetTableValue("property_ownership", "utility1"),
                    CustomNetTables.GetTableValue("property_ownership", "utility2"),
                ];
                let ownedUtilities = railroads.filter(railroad => railroad.owner === propertyState.owner).length;
                return tile.multipliers[ownedUtilities - 1] * diceSum;
            } else if (turnState.type === "card_result") {
                return NaN;
            } else {
                throw "wtf why is it not diceroll state";
            }
        }
    }

    public EndTurn(userId: EntityIndex, event: { PlayerID: PlayerID }) {
        let current = this.GetCurrentPlayerState();
        print("End Turn", current.pID);

        // Anti Cheat, its just this simple
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}

        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();

        let endturn = true;
        if (current.jailed === 0 && current.turnState.rolls.length > 0 && current.turnState.rolls.length < 3) {
            let diceRolls = current.turnState.rolls[current.turnState.rolls.length - 1];
            if (diceRolls.dice1 === diceRolls.dice2) {
                print("End turn bypassed by doubles?");
                endturn = false;
            }
        }
        if (endturn) {
            if (current.jailed === 0) {
                let currentTile = Entities.FindByName(undefined, TilesReverseLookup[current.location]);
                if (!currentTile) {
                    print(`Unable to find entity for tile ${TilesReverseLookup[current.location]} on location ${current.location}`);
                    return;
                }
                let offsetVector: Vector;
                if (current.location < 10) {
                    offsetVector = Vector(100, 100);
                } else if (current.location < 20) {
                    offsetVector = Vector(100, -100);
                } else if (current.location < 30) {
                    offsetVector = Vector(-100, -100);
                } else {
                    offsetVector = Vector(-100, 100);
                }
                currentHero.MoveToPosition((currentTile.GetAbsOrigin() + offsetVector) as Vector);
            }            
    
            let currentTurn = CustomNetTables.GetTableValue("misc", "current_turn");
            let rollOrder = CustomNetTables.GetTableValue("misc", "roll_order");
            let currentIndex = Object.values(rollOrder).find(pID => currentTurn.pID === pID);
            if (!currentIndex) { 
                throw "Can't find the index :(";
            }
            print(currentTurn);
            DeepPrintTable(rollOrder);
            let savedTurn: TurnState = { pID: rollOrder[tostring((currentIndex + 1) % Object.keys(rollOrder).length)], rolls: [], type: "transition"};
            DeepPrintTable(savedTurn);
            CustomNetTables.SetTableValue("misc", "current_turn", savedTurn);
            this.StartTurn();
        } else {
            let indicators: Partial<Record<Tiles, number>> = {};
            print(TilesReverseLookup);
            DeepPrintTable(TilesReverseLookup);
            for (let i = 1; i <= 12; i++) {
                let indicatorSpot = (current.location + i) % 40;
                indicators[TilesReverseLookup[indicatorSpot]] = i;
            }
            CustomNetTables.SetTableValue("misc", "current_turn", {type: "start", pID: current.pID, rolls: current.turnState.rolls, indicators});
        }
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            if (PlayerResource.IsValidPlayer(i)) {
                let player = PlayerResource.GetPlayer(i);
                let hero = player?.GetAssignedHero();
                if (!hero) {
                    print("Panic");
                    return;
                }
                PlayerResource.ReplaceHeroWith(i, hero.GetClassname(), 0, 0);
            }
        }
        CustomNetTables.SetTableValue("misc", "current_turn", {type: "transition", pID: -1, rolls: []});
        Timers.CreateTimer(1, () => this.StartGame());
    }
}

function ShuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}