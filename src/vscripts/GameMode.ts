import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

const MonopolisPrices: Record<Tiles, number> = {
    "brown1": 60,
    "brown2": 60,

    "teal1": 100,
    "teal2": 100,
    "teal3": 120,

    "magenta1": 140,
    "magenta2": 140,
    "magenta3": 160,

    "orange1": 180,
    "orange2": 180,
    "orange3": 200,

    "red1": 220,
    "red2": 220,
    "red3": 240,

    "yellow1": 260,
    "yellow2": 260,
    "yellow3": 280,

    "green1": 300,
    "green2": 300,
    "green3": 320,

    "blue1": 350,
    "blue2": 400,

    "railroad1": 200,
    "railroad2": 200,
    "railroad3": 200,
    "railroad4": 200,

    "utility1": 150,
    "utility2": 150,

    "tax1": -200,
    "tax2": -100
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);

        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            for (let i = 0; i < 4; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
            }
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
            Timers.CreateTimer(0.2, () => this.StartGame());

            CustomGameEventManager.Send_ServerToAllClients("monopolis_price_definitions", { prices: MonopolisPrices})
        }
    }

    private StartGame(): void {
        print("Game starting!");

        // Do some stuff here
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");        
        CustomGameEventManager.Send_ServerToAllClients("monopolis_price_definitions", { prices: MonopolisPrices})
    }
}
