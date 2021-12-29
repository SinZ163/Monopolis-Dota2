const MOVEMENT_SCHEDULE_TIMER = 0.1;

CustomNetTables.SubscribeNetTableListener("misc", (_, key, value) => {
    if (key !== "current_turn") return;
    let currentState = $.GetContextPanel().GetAttributeString("currentstate", "undefined");
    $.Msg(_, "|", key, "|", value);
    $.Msg(currentState, "|", value.type);

    if (currentState !== "undefined") {
        $.GetContextPanel().RemoveClass(currentState);
    }
    
    // Why does TS think value.type is sometimes a number, nani
    if (typeof(value.type) === "number") {
        $.Msg("WARNING: Value.type is a number: ", key, "|", value);
        return;
    };
    $.GetContextPanel().AddClass(value.type);
    $.GetContextPanel().SetAttributeString("currentstate", value.type);

    let currentTurn = $.GetContextPanel().GetAttributeInt("currentturn", -1);
    if (value.pID !== currentTurn) {
        $.GetContextPanel().RemoveClass("JailDice");
        $.GetContextPanel().RemoveClass("JailPreRolled");
        $.GetContextPanel().RemoveClass(`Turn_${currentTurn}`);
        $.GetContextPanel().AddClass(`Turn_${value.pID}`);
        $.GetContextPanel().SetAttributeInt("currentturn", value.pID);

        const heroEntIndex = Players.GetPlayerHeroEntityIndex(value.pID);
        GameUI.SetCameraTarget(heroEntIndex);

        let movementSchedule = $.GetContextPanel().GetAttributeInt("movementSchedule", -1);
        try {
            $.Msg(movementSchedule);
            if (movementSchedule > -1) {
                $.CancelScheduled(movementSchedule as ScheduleID);
            }
        } catch {}
        $.Msg("Starting movement");
        MovementSchedule(true);
    }

    let diceRolls = toArray((value as TurnState).rolls);
    let isDoubles = (diceRolls.length > 0 && diceRolls.length < 3 && diceRolls[diceRolls.length - 1].dice1 === diceRolls[diceRolls.length - 1].dice2);

    try {
        if (!isDoubles && (value.type === "endturn" || value.type === "unowned" || value.type === "payrent")) {
            $.Msg("Cancelling movement");
            let movementSchedule = $.GetContextPanel().GetAttributeInt("movementSchedule", -1);
            if (movementSchedule > -1) {
                $.CancelScheduled(movementSchedule as ScheduleID);
            }
        }
    } catch {}

    switch(value.type) {
        case "diceroll":
            ($("#dice1") as LabelPanel).text = value.dice1.toFixed(0);
            ($("#dice2") as LabelPanel).text = value.dice2.toFixed(0);
            if (isDoubles) {
                ($("#endturnLabel") as LabelPanel).text = $.Localize("reroll");
            } else {
                ($("#endturnLabel") as LabelPanel).text = $.Localize("endturn");
            }
            break;
        case "start":
            let moneyContainer = $("#MoneyTable");
            if (moneyContainer.BHasClass("Hidden")) {
                for (let row of moneyContainer.Children()) {
                    let pID = row.id.split("_")[1];
                    row.style.backgroundColor = ColorToHexCode2(Players.GetPlayerColor(Number.parseInt(pID) as PlayerID));
                }
                moneyContainer.RemoveClass("Hidden");
            }
            break;
        case "unowned":
            $("#buypropertyLabel").SetDialogVariableLocString("property", `#tile_${value.property}`);
            break;
        case "payrent":
            $("#payrentLabel").SetDialogVariableInt("price", value.price);
            break;
        case "jailed":
            $("#payrentLabel").SetDialogVariableInt("price", 50);
            if (value.preRolled) {
                $.GetContextPanel().AddClass("JailPreRolled");
            }
            break;
        case "endturn":
            let playerState = CustomNetTables.GetTableValue("player_state", value.pID.toFixed(0));
            $.Msg(playerState);
            if (playerState.jailed > 0 && playerState.jailed < 3) {
                $.GetContextPanel().AddClass("JailDice");
                let diceRolls = toArray(value.rolls);
                ($("#dice1") as LabelPanel).text = diceRolls[diceRolls.length - 1].dice1.toFixed(0);
                ($("#dice2") as LabelPanel).text = diceRolls[diceRolls.length - 1].dice2.toFixed(0);
            }
    }
});

function RollDice() {
    GameEvents.SendCustomGameEventToServer("monopolis_requestdiceroll", {});
}

function BuyProperty() {
    GameEvents.SendCustomGameEventToServer("monopolis_requestpurchase", {});
}
function Auction() {
    GameEvents.SendCustomGameEventToServer("monopolis_requestauction", {});
}

function PayRent() {
    GameEvents.SendCustomGameEventToServer("monopolis_requestpayrent", {});
}

function Endturn() {
    GameEvents.SendCustomGameEventToServer("monopolis_endturn", {});
}

function StartTrade() {
    $("#TradeScreen").RemoveClass("Hidden");
}

CustomNetTables.SubscribeNetTableListener("player_state", (_, pID, state) => {
    $.Msg("Hud.ts", _, pID, state);
    let existingPanel = $(`#MoneyTable_${pID}`);
    if (!existingPanel) {
        $.Msg("Doesn't exist?");
        existingPanel = $.CreatePanel("Panel", $("#MoneyTable"), `MoneyTable_${pID}`);
        existingPanel.BLoadLayoutSnippet("MoneyTableRow");

        (existingPanel.FindChildTraverse("Image") as AvatarImage).steamid = Game.GetPlayerInfo(Number.parseInt(pID) as PlayerID).player_steamid;
        (existingPanel.FindChildTraverse("Name") as UserName).steamid = Game.GetPlayerInfo(Number.parseInt(pID) as PlayerID).player_steamid;
    }
    (existingPanel.FindChildTraverse("GoldAmount") as LabelPanel).text = state.money.toFixed(0);
        existingPanel.style.backgroundColor = ColorToHexCode2(Players.GetPlayerColor(Number.parseInt(pID) as PlayerID));

    let currentTurn = $.GetContextPanel().GetAttributeInt("currentturn", -1);
    // Jailed people dont get to reroll
    if (currentTurn === state.pID && state.jailed > 0) {
        ($("#endturnLabel") as LabelPanel).text = $.Localize("endturn");
    } 
});


function AddHouse(tile: PurchasableTiles) {
    $.Msg("Adding house to ", tile);
    let property = CustomNetTables.GetAllTableValues("property_ownership").find(kv => kv.key === tile)?.value;
    if (!property) return;
    if (property.houseCount > 5) return
    GameEvents.SendCustomGameEventToServer("monopolis_requestrenovation", {property: tile, houseCount: property.houseCount + 1});
}
function RemoveHouse(tile: PurchasableTiles) {
    $.Msg("Removing house from ", tile);
    let property = CustomNetTables.GetAllTableValues("property_ownership").find(kv => kv.key === tile)?.value;
    if (!property) return;
    if (property.houseCount < -1) return
    GameEvents.SendCustomGameEventToServer("monopolis_requestrenovation", {property: tile, houseCount: property.houseCount - 1});
}


CustomNetTables.SubscribeNetTableListener("property_ownership", (_, tile, value) => {
    let existingPanel = $(`#PropertyManagement_${tile}`);
    if (!existingPanel) {
        existingPanel = $.CreatePanel("Panel", $("#PropertyManagement"), `PropertyManagement_${tile}`);
        existingPanel.BLoadLayoutSnippet("PropertyManagementRow");
        (existingPanel.FindChildTraverse("PropertyName") as LabelPanel).text = $.Localize(`#tile_${tile}`);
        existingPanel.FindChildTraverse("BuyHouse")?.SetPanelEvent("onactivate", () => AddHouse(tile));
        existingPanel.FindChildTraverse("SellHouse")?.SetPanelEvent("onactivate", () => RemoveHouse(tile));
    }
    // default to -2 so the -1's coming in from unowned cause the handler to run
    let currentOwner = existingPanel.GetAttributeInt("current_owner", -2);
    if (value.owner !== currentOwner) {
        existingPanel.RemoveClass(`Owner_${currentOwner}`);
        existingPanel.AddClass(`Owner_${value.owner}`);
        existingPanel.SetAttributeInt("current_owner", value.owner);
    }
    // TODO: Proper naming convention for houses / hotels
    // TODO: Block + and - buttons in correct conditions
    (existingPanel.FindChildTraverse("PropertyStatus") as LabelPanel).text = `${value.houseCount === -1 ? "Mortgaged" : "Owned"}`;
})


function ColorToHexCode2(color: number) {
	var red = (color & 0xff).toString(16);
	var green = ((color & 0xff00) >> 8).toString(16);
	var blue = ((color & 0xff0000) >> 16).toString(16);
	if (red == "0") {
		red = "00"
	}
	if (green == "0") {
		green = "00"
	}
	if (blue == "0") {
		blue = "00"
	}
	return '#' + red + green + blue;
}
/**
 * Turn a table object into an array.
 * @param obj The object to transform to an array.
 * @returns An array with items of the value type of the original object.
 */
function toArray<T>(obj: Record<number, T>): T[] {
    const result = [];
    
    let key = 1;
    while (obj[key]) {
        result.push(obj[key]);
        key++;
    }

    return result;
}

function MovementSchedule(start = false) {
    let currentTurn = $.GetContextPanel().GetAttributeInt("currentturn", -1);
    if (currentTurn === -1) return;
    const heroEntIndex = Players.GetPlayerHeroEntityIndex(currentTurn as PlayerID);
    const heroLoc = Entities.GetAbsOrigin(heroEntIndex);
    let currentYaw = GameUI.GetCameraYaw();
    let newYaw = -1;
    if (heroLoc[1] < -1100) {
        newYaw = 0+45;
    } else if (heroLoc[0] < -1800) {
        newYaw = 270+45;
    } else if (heroLoc[0] > 1800) {
        newYaw = 90+45;
    } else {
        newYaw = 180+45;
    }
    if (start) {
        $.Msg(`Hero Location: ${heroLoc}, current: ${currentYaw} new: ${newYaw}`);
    }
    if (currentYaw !== newYaw) {
        $.Msg(`Changing yaw to ${newYaw} due to location ${heroLoc}`);
        GameUI.SetCameraYaw(newYaw);
        GameUI.SetCameraPitchMax(30);
    }    

    $.GetContextPanel().SetAttributeInt("movementSchedule", $.Schedule(MOVEMENT_SCHEDULE_TIMER, MovementSchedule));
}