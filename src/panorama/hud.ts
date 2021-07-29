CustomNetTables.SubscribeNetTableListener("misc", (_, key, value) => {
    if (key !== "current_turn") return;
    $.Msg(_, key, value);

    switch(value.type) {
        case "diceroll":
            ($("#dice1") as LabelPanel).text = value.dice1.toFixed(0);
            ($("#dice2") as LabelPanel).text = value.dice2.toFixed(0); 
            $("#DiceRoll").RemoveClass("Hidden");
            break;

        case "start":
            $("#RollDiceButton").RemoveClass("Hidden");
            let moneyContainer = $("#MoneyTable");
            if (moneyContainer.BHasClass("Hidden")) {
                for (let row of moneyContainer.Children()) {
                    let pID = row.id.split("_")[1];
                    row.style.backgroundColor = ColorToHexCode2(Players.GetPlayerColor(Number.parseInt(pID) as PlayerID));
                }
                moneyContainer.RemoveClass("Hidden");
            }
        break;
        case "endturn":
            $("#Endturn").RemoveClass("Hidden");
            $("#DiceRoll").AddClass("Hidden");
            break;
    }
});

function RollDice() {
    $("#RollDiceButton").AddClass("Hidden");
    GameEvents.SendCustomGameEventToServer("monopolis_requestdiceroll", {});
}

function Endturn() {
    $("#Endturn").AddClass("Hidden");
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