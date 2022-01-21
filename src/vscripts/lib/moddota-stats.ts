class ModDotaStats {
    private realSetGameWinner: (team: DotaTeam) => void;
    private publishFrequency = 60;

    private key: string;
    private workshopId: string;
    
    // TODO: Make settings a thing when I care about settings
    private settings: any;

    private gameInfo: any[];
    
    constructor(options: InitOptions) {
        this.key = options.key ?? "moddota-stats";
        // if people start using this in Lua land or ignoring TS errors
        if (!options.workshopId) {
            throw new Error("Missing mandatory param workshopId");
        }
        this.workshopId = options.workshopId;

        this.gameInfo = [];
        
        ListenToGameEvent("game_rules_state_change", () => {
            this.OnStateChange();
        }, undefined);
        try {
            this.PublishInit();
        } catch(e) {
            print(e);
        }
        this.realSetGameWinner = GameRules.SetGameWinner;
        GameRules.SetGameWinner = (team:DotaTeam) => {
            this.realSetGameWinner.call(GameRules, team);
            this.PublishGameEnded(team);
        }
    }
    public AddRoundInfo(round: any) {
        this.gameInfo.push(round);
    }
    public SetGameInfo(gameInfo: any) {
        this.gameInfo = gameInfo;
    }
    private PublishInit() {
        this.SendMessage(undefined);
    }
    private PublishAllPlayers() {
        this.SendMessage(undefined);
    }
    private PublishGameStarted() {
        this.SendMessage({settings: this.settings});
    }
    private PublishGameEnded(team: DotaTeam) {
        this.SendMessage({settings: this.settings, gameInfo: this.gameInfo, winner: team});
    }
    private SendMessage(payload: any) {
        let req = CreateHTTPRequestScriptVM("POST", "https://stats-api.moddota.com/GameMode/Telemetry");
        let players = [];
        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            if (PlayerResource.IsValidPlayer(i)) {
                players.push({
                    pID: i,
                    steamId64: tostring(PlayerResource.GetSteamID(i)),
                    partyId: tostring(PlayerResource.GetPartyID(i)),
                    isHost: GameRules.PlayerHasCustomGameHostPrivileges(PlayerResource.GetPlayer(i)!),
                    hero: PlayerResource.GetPlayer(i)?.GetAssignedHero()?.GetUnitName() ?? "n/a",
                    heroRandom: PlayerResource.HasRandomed(i),
                    connection: PlayerResource.GetConnectionState(i),
                    team: PlayerResource.GetTeam(i)
                })
            }
        }
        let wrapper = {
            matchId: tostring(GameRules.Script_GetMatchID()),
            players,
            gameTime: GameRules.GetGameTime(),
            dotaTime: GameRules.GetDOTATime(true, true),
            state: GameRules.State_Get(),
            payload
        }
        let msg = json.encode(wrapper)
        req.SetHTTPRequestRawPostBody("application/json", msg);
        req.SetHTTPRequestHeaderValue("Authorization", `Dedicated ${this.workshopId}-${GetDedicatedServerKeyV2(this.key)}`);
        print("ModDotaStats: About to send payload", msg.length);
        req.Send(res => {
            if (res.StatusCode !== 200) {
                // TODO: if we ever get error messages here, do logic here?
                print("ModDotaStats: An error has occured, " + res.StatusCode + ", " + res.Body);
                return;
            }
            if ((res.Body?.length ?? 0) === 0) {
                print("ModDotaStats: Empty body, ok...");
                return;
            }
            // TODO: if we ever get responses, do logic here?
            print("ModDotaStats: Success, " + res.Body);
        });
    }

    private OnStateChange() {
        const state = GameRules.State_Get();
        print("ModDotaStats ", state);
        switch(state) {
            case GameState.CUSTOM_GAME_SETUP:
                this.PublishAllPlayers();
                break;
            case GameState.GAME_IN_PROGRESS:
                this.PublishGameStarted();
                Timers.CreateTimer(this.publishFrequency, () => {
                    this.SendMessage({settings: this.settings, gameInfo: this.gameInfo});
                    return this.publishFrequency;
                })
                break;
        }
    }
}

interface InitOptions {
    workshopId: string;
    key?: string;
}

let instance: ModDotaStats|undefined = undefined;
export function initiate(options: InitOptions) {
    instance = new ModDotaStats(options);
}

let singleton = {
    AddRoundInfo: (roundInfo: any) => instance?.AddRoundInfo(roundInfo),
    SetGameInfo: (gameInfo: any) => instance?.SetGameInfo(gameInfo),
}

export default singleton;