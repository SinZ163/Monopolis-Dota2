import { reloadable } from "./lib/tstl-utils";
import { modifier_vision } from "./modifiers/modifier_panic";

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
interface PlayerState {
    pID: PlayerID;
    money: number;
    ownedProperties: PropertyOwnership[];
    location: number;
}
interface PropertyOwnership {
    property: PricedTiles;
    houseCount: number;
}

@reloadable
export class GameMode {
    public state: GameState = { players: [], currentTurn: -1 };

    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource(
            "particle",
            "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf",
            context
        );
        PrecacheResource(
            "soundfile",
            "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts",
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

        SetTeamCustomHealthbarColor(DotaTeam.CUSTOM_1, 255, 0, 0);
        SetTeamCustomHealthbarColor(DotaTeam.CUSTOM_2, 0, 255, 0);
        SetTeamCustomHealthbarColor(DotaTeam.CUSTOM_3, 0, 0, 255);
        SetTeamCustomHealthbarColor(DotaTeam.CUSTOM_4, 255, 0, 255);
        SetTeamCustomHealthbarColor(DotaTeam.CUSTOM_5, 255, 255, 0);
        SetTeamCustomHealthbarColor(DotaTeam.CUSTOM_6, 0, 255, 255);

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
                Timers.CreateTimer(3, () => {
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

    private StartGame(): void {
        print("Game starting!");
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
        this.state = {
            currentTurn: 0,
            players: [],
        };

        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            if (PlayerResource.IsValidPlayer(i)) {
                print(`${i} is a valid player?`);
                let player = PlayerResource.GetPlayer(i);
                if (!player) break;

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

                this.state.players.push({
                    pID: i,
                    money: 1500,
                    ownedProperties: [],
                    location: 0,
                });
            }
        }
        this.StartTurn();
    }

    public StartTurn() {
        print("TURN START", this.state.currentTurn);
        let current = this.state.players[this.state.currentTurn];

        let currentPlayer = PlayerResource.GetPlayer(current.pID);
        if (!currentPlayer) {
            print("WTF why is player state on an invalid player");
            return;
        }
        let currentHero = currentPlayer.GetAssignedHero();
        let tiles = Entities.FindAllByClassnameWithin(
            "point_clientui_world_panel",
            currentHero.GetAbsOrigin(),
            700
        );
        //print(DeepPrintTable(tiles));
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
        Timers.CreateTimer(3, () => {
            let dice1 = RandomInt(1, 6);
            let dice2 = RandomInt(1, 6);

            // TODO: Doubles logic
            print(dice1, dice2);
            let futureLocation = current.location + dice1 + dice2;

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
                    (futureSide == currentSide + 1 && futureDelta === 0)
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
            Timers.CreateTimer(20, () => {
                print("Did we make it?");
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

                this.state.currentTurn =
                    ++this.state.currentTurn % this.state.players.length;
                Timers.CreateTimer(5, () => this.StartTurn());
            });
        });
    }

    public MoveToSpace() {}

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        Timers.RemoveTimers(true);
        this.StartGame();
    }
}
