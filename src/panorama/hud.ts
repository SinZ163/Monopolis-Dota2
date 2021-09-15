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
        $.GetContextPanel().RemoveClass(`Turn_${currentTurn}`);
        $.GetContextPanel().AddClass(`Turn_${value.pID}`);
        $.GetContextPanel().SetAttributeInt("currentturn", value.pID);
    }

    switch(value.type) {
        case "diceroll":
            ($("#dice1") as LabelPanel).text = value.dice1.toFixed(0);
            ($("#dice2") as LabelPanel).text = value.dice2.toFixed(0);
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