const MOVEMENT_SCHEDULE_TIMER = 0.1;

CustomNetTables.SubscribeNetTableListener("misc", (_, key, value) => {
    if (key !== "current_turn") return;
    let currentState = $.GetContextPanel().GetAttributeString("currentstate", "undefined");
    let turnState = value as TurnState;
    $.Msg(_, "|", key, "|", turnState);
    $.Msg(currentState, "|", turnState.type);

    if (currentState !== "undefined") {
        $.GetContextPanel().RemoveClass(currentState);
    }
    
    // Why does TS think value.type is sometimes a number, nani
    if (typeof(turnState.type) === "number") {
        $.Msg("WARNING: Value.type is a number: ", key, "|", turnState);
        return;
    };
    $.GetContextPanel().AddClass(turnState.type);
    $.GetContextPanel().SetAttributeString("currentstate", turnState.type);

    let currentTurn = $.GetContextPanel().GetAttributeInt("currentturn", -1);
    if (turnState.pID !== currentTurn) {
        $.GetContextPanel().RemoveClass("JailDice");
        $.GetContextPanel().RemoveClass("JailPreRolled");
        $.GetContextPanel().RemoveClass(`Turn_${currentTurn}`);
        $.GetContextPanel().AddClass(`Turn_${turnState.pID}`);
        $.GetContextPanel().SetAttributeInt("currentturn", turnState.pID);

        const heroEntIndex = Players.GetPlayerHeroEntityIndex(turnState.pID);
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

    let diceRolls = toArray(turnState.rolls);
    let isDoubles = (diceRolls.length > 0 && diceRolls.length < 3 && diceRolls[diceRolls.length - 1].dice1 === diceRolls[diceRolls.length - 1].dice2);

    try {
        if (!isDoubles && (turnState.type === "endturn" || turnState.type === "unowned" || turnState.type === "payrent")) {
            $.Msg("Cancelling movement");
            let movementSchedule = $.GetContextPanel().GetAttributeInt("movementSchedule", -1);
            if (movementSchedule > -1) {
                $.CancelScheduled(movementSchedule as ScheduleID);
            }
        }
    } catch {}

    switch(turnState.type) {
        case "diceroll":
            ($("#dice1") as LabelPanel).text = turnState.dice1.toFixed(0);
            ($("#dice2") as LabelPanel).text = turnState.dice2.toFixed(0);
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
            $("#buypropertyLabel").SetDialogVariableLocString("property", `#tile_${turnState.property}`);
            break;
        case "payrent":
            $("#payrentLabel").SetDialogVariableInt("price", turnState.price);
            break;
        case "jailed":
            $("#payrentLabel").SetDialogVariableInt("price", 50);
            if (turnState.preRolled) {
                $.GetContextPanel().AddClass("JailPreRolled");
            }
            break;
        case "card_prompt":
            let imageUrl: string;
            switch (turnState.deck) {
                case "chance":
                    imageUrl = "s2r://panorama/images/spellicons/ogre_magi_multicast_png.vtex";
                    break;
                case "communitybreast":
                    imageUrl = "s2r://panorama/images/spellicons/invoker_invoke_png.vtex";
                    break;
            } 
            ($("#CardPromptImage") as ImagePanel).SetImage(imageUrl);
            ($("#CardDeckType") as LabelPanel).text = $.Localize(`deck_${turnState.deck}`);
            break;
        case "card_result":
            $.Msg("Can you see me god?");
            try {
                let colourClass = "";
                $("#CardResultButton").RemoveClass("green");
                $("#CardResultButton").RemoveClass("red");
                switch(turnState.card.type) {
                    case "fuckjail":
                        colourClass = "green";
                        break;
                    case "money_gain":
                    case "money_gain_others":
                        colourClass = "green";
                        $("#CardResultText").SetDialogVariableInt("value", turnState.card.value);                        $("#CardResultButtonText").SetDialogVariableInt("value", turnState.card.value);
                        $("#CardResultButtonText").SetDialogVariableInt("value", turnState.card.value);
                        break;
                    case "jail":
                        colourClass = "red";
                        break;
                    case "money_lose":
                    case "money_lose_others":
                        colourClass = "red";
                        $("#CardResultText").SetDialogVariableInt("value", turnState.card.value);                        $("#CardResultText").SetDialogVariableInt("value", turnState.card.value);
                        $("#CardResultButtonText").SetDialogVariableInt("value", turnState.card.value);
                        break;
                    case "repairs":
                        colourClass = "red";
                        $("#CardResultText").SetDialogVariableInt("house", turnState.card.house);
                        $("#CardResultText").SetDialogVariableInt("hotel", turnState.card.hotel);
                        break;
                    case "teleport":
                        $("#CardResultText").SetDialogVariableLocString("dest", "tile_" + turnState.card.dest);
                        break;
                    case "teleport_relative":
                        $("#CardResultText").SetDialogVariableInt("value", Math.abs(turnState.card.value));                        $("#CardResultButtonText").SetDialogVariableInt("value", turnState.card.value);
                        $("#CardResultButtonText").SetDialogVariableInt("value", Math.abs(turnState.card.value));
                        break;
                }
                $.Msg("A");
                let text = $.Localize("card_" + turnState.card.type, $("#CardResultButtonText"));
                $.Msg("B");
                $.Msg(text);
                $.Msg("B.2");
                ($("#CardResultButtonText") as LabelPanel).text = text;
                $.Msg("C");
                let resultText = $.Localize(turnState.card.text, $("#CardResultText"));
                $.Msg("D");
                $.Msg(resultText);
                $.Msg("D.2");
                ($("#CardResultText") as LabelPanel).text = resultText;
                $.Msg("E");
                if (colourClass !== "") {
                    $("#CardResultButton").AddClass(colourClass);
                }
            } catch (e) {
                $.Msg(e);
            }            
            $.Msg("Am I alive?!");
            break;
        case "endturn":
            let playerState = CustomNetTables.GetTableValue("player_state", turnState.pID.toFixed(0));
            $.Msg(playerState);
            if (playerState.jailed > 0 && playerState.jailed < 3) {
                $.GetContextPanel().AddClass("JailDice");
                let diceRolls = toArray(turnState.rolls);
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

function DrawCard() {
    $.Msg("Draw card?");
    GameEvents.SendCustomGameEventToServer("monopolis_requestcard", {});
}
function AcknowledgeCard() {
    GameEvents.SendCustomGameEventToServer("monopolis_acknowledgecard", {});
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
        let colourPanel = existingPanel.FindChildTraverse("PropertyColour");
        if (!colourPanel) return;
        switch (tile) {
            case "brown1":
            case "brown2":
                colourPanel.AddClass("brown");
                break;
            case "teal1":
            case "teal2":
            case "teal3":
                colourPanel.AddClass("teal");
                break;
            case "magenta1":
            case "magenta2":
            case "magenta3":
                colourPanel.AddClass("magenta");
                break;
            case "orange1":
            case "orange2":
            case "orange3":
                colourPanel.AddClass("orange");
                break;
            case "red1":
            case "red2":
            case "red3":
                colourPanel.AddClass("red");
                break;
            case "yellow1":
            case "yellow2":
            case "yellow3":
                colourPanel.AddClass("yellow");
                break;
            case "green1":
            case "green2":
            case "green3":
                colourPanel.AddClass("green");
                break;
            case "blue1":
            case "blue2":
                colourPanel.AddClass("blue");
                break;
            case "railroad1":
            case "railroad2":
            case "railroad3":
            case "railroad4":
                colourPanel.AddClass("black");
                break;
            case "utility1":
            case "utility2":
                colourPanel.AddClass("white");
                break;
        }
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