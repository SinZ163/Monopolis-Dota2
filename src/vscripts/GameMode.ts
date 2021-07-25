import { reloadable } from "./lib/tstl-utils";
import { modifier_movetotile } from "./modifiers/modifier_movetotile";
import { modifier_vision } from "./modifiers/modifier_vision";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

const MonopolisPrices: Record<PricedTiles, number> = {
    brown1: 60,
    brown2: 60,

    teal1: 100,
    teal2: 100,
    teal3: 120,

    magenta1: 140,
    magenta2: 140,
    magenta3: 160,

    orange1: 180,
    orange2: 180,
    orange3: 200,

    red1: 220,
    red2: 220,
    red3: 240,

    yellow1: 260,
    yellow2: 260,
    yellow3: 280,

    green1: 300,
    green2: 300,
    green3: 320,

    blue1: 350,
    blue2: 400,

    railroad1: 200,
    railroad2: 200,
    railroad3: 200,
    railroad4: 200,

    utility1: 150,
    utility2: 150,

    tax1: -200,
    tax2: -100,
};

const HousePrices: Record<HouseTiles, number> = {
    brown1: 50,
    brown2: 50,

    teal1: 50,
    teal2: 50,
    teal3: 50,

    magenta1: 100,
    magenta2: 100,
    magenta3: 100,

    orange1: 100,
    orange2: 100,
    orange3: 100,

    red1: 150,
    red2: 150,
    red3: 150,

    yellow1: 150,
    yellow2: 150,
    yellow3: 150,

    green1: 200,
    green2: 200,
    green3: 200,

    blue1: 200,
    blue2: 200,
};

const TilesObj = {
    go: 0,
    brown1: 1,
    communitybreast1: 2,
    brown2: 3,
    tax1: 4,
    railroad1: 5,
    teal1: 6,
    chance1: 7,
    teal2: 8,
    teal3: 9,
    jail: 10,
    magenta1: 11,
    utility1: 12,
    magenta2: 13,
    magenta3: 14,
    railroad2: 15,
    orange1: 16,
    communitybreast2: 17,
    orange2: 18,
    orange3: 19,
    freeparking: 20,
    red1: 21,
    chance2: 22,
    red2: 23,
    red3: 24,
    railroad3: 25,
    yellow1: 26,
    yellow2: 27,
    utility2: 28,
    yellow3: 29,
    gotojail: 30,
    green1: 31,
    green2: 32,
    communitybreast3: 33,
    green3: 34,
    railroad4: 35,
    chance3: 36,
    blue1: 37,
    tax2: 38,
    blue2: 39
};
const TilesReverseLookup: Record<number,Tiles> = Object.fromEntries(Object.entries(TilesObj).map<[number, Tiles]>(val => [val[1], val[0] as Tiles]));

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

    public IsPurchasableTile(tile: Tiles|string): tile is PurchasableTiles {
        if (tile.startsWith("chance")) return false;
        if (tile.startsWith("community")) return false;
        if (tile.startsWith("tax")) return false;
        if (tile === "go") return false;
        if (tile === "jail") return false;
        if (tile === "gotojail") return false;
        if (tile === "freeparking") return false;
        return true;
    }

    private StartGame(): void {
        print("Game starting!");
        CustomGameEventManager.Send_ServerToAllClients("monopolis_safetoendturn", {});
        CustomGameEventManager.Send_ServerToAllClients(
            "monopolis_price_definitions",
            { prices: MonopolisPrices, houses: HousePrices }
        );

        let go = Entities.FindByName(undefined,"go");
        if (!go) {
            print("Warning: GO isn't on the map, this will fail.");
            return;
        }

        // TODO: Do logic to determine roll order
        for (let tile of Object.keys(TilesObj)) {
            if (this.IsPurchasableTile(tile)) {
                CustomNetTables.SetTableValue("property_ownership", tile, {
                    houseCount: 0,
                    owner: -1
                });
            }
        }
        CustomNetTables.SetTableValue("misc", "current_turn", {pID: 0, index: 1});
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
            if (
                currentSide === futureSide ||
                (futureSide == (currentSide + 1)%4 && futureDelta === 0)
            ) {
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
            ExecuteOrderFromTable({
                OrderType: UnitOrder.MOVE_TO_POSITION,
                UnitIndex: currentHero.GetEntityIndex(),
                Position: position,
                Queue: !firstMovement,
            });
            current.location = (current.location + rowAmount) % 40;
            firstMovement = false;
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
        DeepPrintTable(current);
        print(property);
        if (this.IsPurchasableTile(property)) {
            print("Is Purchasable?");
            let propertyState = CustomNetTables.GetTableValue("property_ownership", property);
            if (propertyState.owner === -1 && MonopolisPrices[property] >= current.money) {
                print("Sold, to the current bidder");
                propertyState.owner = current.pID;
                current.money -= MonopolisPrices[property];
                CustomNetTables.SetTableValue("player_state", tostring(current.pID), current);
                CustomNetTables.SetTableValue("property_ownership", property, propertyState);
            }
        } else {
            // TODO: implement tax/chance/communitybreast/etc
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
