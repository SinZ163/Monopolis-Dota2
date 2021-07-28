import { reloadable } from "./lib/tstl-utils";
import { modifier_movetotile } from "./modifiers/modifier_movetotile";
import { modifier_vision } from "./modifiers/modifier_vision";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

const TilesObj: Record<Tiles,SpaceDefinition> = {
    go: {
        type: "misc",
        id: "go",
        index: 0
    },
    brown1: {
        type: "property",
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
        index: 5,
        purchasePrice: 200,
        price1: 25,
        price2: 50,
        price3: 100,
        price4: 200
    },
    teal1: {
        type: "property",
        id: "teal1",
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
        index: 12,
        purchasePrice: 150,
        singleMultiplier: 4,
        monopolyMultiplier: 10
    },
    magenta2: {
        type: "property",
        id: "magenta2",
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
        index: 15,
        purchasePrice: 200,
        price1: 25,
        price2: 50,
        price3: 100,
        price4: 200
    },
    orange1: {
        type: "property",
        id: "orange1",
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
        index: 25,
        purchasePrice: 200,
        price1: 25,
        price2: 50,
        price3: 100,
        price4: 200
    },
    yellow1: {
        type: "property",
        id: "yellow1",
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
        index: 28,
        purchasePrice: 150,
        singleMultiplier: 4,
        monopolyMultiplier: 10
    },
    yellow3: {
        type: "property",
        id: "yellow3",
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
        index: 35,
        purchasePrice: 200,
        price1: 25,
        price2: 50,
        price3: 100,
        price4: 200
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
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
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

        GameRules.SetShowcaseTime(0);
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
        CustomGameEventManager.Send_ServerToAllClients("monopolis_safetoendturn", {});
        CustomGameEventManager.Send_ServerToAllClients(
            "monopolis_price_definitions",
            TilesObj
        );

        let go = Entities.FindByName(undefined,"go");
        if (!go) {
            print("Warning: GO isn't on the map, this will fail.");
            return;
        }

        // TODO: Do logic to determine roll order
        for (let tile of Object.values(TilesObj)) {
            if (this.IsPurchasableTile(tile)) {
                CustomNetTables.SetTableValue("property_ownership", tile.id, {
                    houseCount: 0,
                    owner: -1
                });
            }
        }
        CustomNetTables.SetTableValue("misc", "current_turn", {pID: 0, index: 0});
        let rollOrder: Record<string, PlayerID> = {};
        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            if (PlayerResource.IsValidPlayer(i)) {
                print(`${i} is a valid player?`);
                let player = PlayerResource.GetPlayer(i);
                if (!player) break;
                rollOrder[i] = i;

                player.GetTeam()
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
                });
            }
        }
        CustomNetTables.SetTableValue("misc", "roll_order", rollOrder);
        this.StartTurn();
    }

    public GetCurrentPlayerState() {
        return CustomNetTables.GetTableValue("player_state", tostring(CustomNetTables.GetTableValue("misc", "current_turn").pID));
    }

    public StartTurn() {
        let current = this.GetCurrentPlayerState();
        print("Turn Start", current.pID);

        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();
        let currentTile = Entities.FindByName(undefined, TilesReverseLookup[current.location]);
        if (!currentTile) {
            print(`Unable to find entity for tile ${TilesReverseLookup[current.location]} on location ${current.location}`);
            return;
        }

        let middleVector = Vector(0, 0, 0);
        if (current.location < 10) {
            middleVector = Vector(200, 500, 0);
        } else if (current.location < 20) {
            middleVector = Vector(500, -200, 0);
        } else if (current.location < 30) {
            middleVector = Vector(-200, -500, 0);
        } else {
            middleVector = Vector(-500, 200);
        }

        currentHero.MoveToPosition(
            (currentTile.GetAbsOrigin() + middleVector) as Vector
        );

        let indicators: Partial<Record<Tiles, number>> = {};
        print(TilesReverseLookup);
        DeepPrintTable(TilesReverseLookup);
        for (let i = 1; i <= 12; i++) {
            let indicatorSpot = (current.location + i) % 40;
            indicators[TilesReverseLookup[indicatorSpot]] = i;
        }

        CustomGameEventManager.Send_ServerToAllClients("monopolis_startturn", {indicators});
    }
    public RollDice(userId: EntityIndex, event: { PlayerID: PlayerID}) {
        let current = this.GetCurrentPlayerState();
        print("Roll Dice", current.pID);

        // Anti Cheat, its just this simple
        if (!IsInToolsMode() && event.PlayerID !== current.pID) {return;}

        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();
        let currentTile = Entities.FindByName(undefined, TilesReverseLookup[current.location]);
        if (!currentTile) {
            print(`Unable to find entity for tile ${TilesReverseLookup[current.location]} on location ${current.location}`);
            return;
        }

        let dice1 = RandomInt(1, 6);
        let dice2 = RandomInt(1, 6);
        CustomGameEventManager.Send_ServerToAllClients("monopolis_diceroll", {dice1, dice2});

        // TODO: Doubles logic
        print(dice1, dice2);
        let futureLocation = (current.location + dice1 + dice2) % 40;

        let position = currentHero.GetAbsOrigin();
        let firstMovement = true;
        do {
            let futureSide = math.floor(futureLocation / 10);
            let currentSide = math.floor(current.location / 10);

            let currentDelta = current.location % 10;
            let futureDelta = futureLocation % 10;

            let rowAmount: number;
            if (currentSide === futureSide) {
                rowAmount = futureDelta - currentDelta;
            } else {
                rowAmount = 10 - currentDelta;
            }
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
            print("Pre Order", firstMovement);
            ExecuteOrderFromTable({
                OrderType: UnitOrder.MOVE_TO_POSITION,
                UnitIndex: currentHero.GetEntityIndex(),
                Position: position,
                Queue: !firstMovement,
            });
            print("Post Order", firstMovement);
            current.location = (current.location + rowAmount) % 40;
            firstMovement = false;
            print(current.location, futureLocation);
        } while (current.location !== futureLocation);
        CustomNetTables.SetTableValue("player_state", tostring(current.pID), current);
        let futureTile = Entities.FindByName(undefined, TilesReverseLookup[futureLocation]);
        if (!futureTile) {
            print("Warning: future location tile is missing? wtf");
            return;
        }
        CreateModifierThinker(currentHero, undefined, modifier_movetotile.name, { duration: -1}, position, currentHero.GetTeam(), false);
    }
    public FoundHero() {
        CustomGameEventManager.Send_ServerToAllClients("monopolis_safetoendturn", {});
        let current = this.GetCurrentPlayerState();
        let property = TilesReverseLookup[current.location];
        let tile = TilesObj[property];
        DeepPrintTable(current);
        print(property);
        if (this.IsPurchasableTile(tile)) {
            print("Is Purchasable?");
            let propertyState = CustomNetTables.GetTableValue("property_ownership", tile.id);
            if (propertyState.owner > -1) {
                print("Well you need to pay up now");
                if (tile.type === "property") {
                    current.money -= tile.rentPrice;
                    let owner = CustomNetTables.GetTableValue("player_state", tostring(propertyState.owner));
                    owner.money += tile.rentPrice;
                    CustomNetTables.SetTableValue("player_state", tostring(owner.pID), owner);
                }
                // TODO: handle railroad and utility in this category
            }
            // TODO: Ask user if they want to buy or auction (must select 1 of 2 to continue game)
            else if (propertyState.owner === -1 && current.money >= tile.purchasePrice) {
                print("Sold, to the current bidder");
                propertyState.owner = current.pID;
                current.money -= tile.purchasePrice;
                CustomNetTables.SetTableValue("property_ownership", tile.id, {...propertyState});
            }
        } else if (tile.type === "tax") {
            print("Taxman wants your money");
            current.money -= tile.cost;
        } else {
            // TODO: implement chance/communitybreast/etc
        }
        CustomNetTables.SetTableValue("player_state", tostring(current.pID), {...current});
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

        let currentTurn = CustomNetTables.GetTableValue("misc", "current_turn").index;
        let rollOrder = CustomNetTables.GetTableValue("misc", "roll_order");
        print(currentTurn);
        DeepPrintTable(rollOrder);
        let savedTurn = { index: (currentTurn + 1) % Object.keys(rollOrder).length, pID: rollOrder[tostring((currentTurn + 1) % Object.keys(rollOrder).length)]};
        DeepPrintTable(savedTurn);
        CustomNetTables.SetTableValue("misc", "current_turn", savedTurn);
        this.StartTurn();
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        this.StartGame();
    }
}
