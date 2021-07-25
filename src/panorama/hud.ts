GameEvents.Subscribe("monopolis_safetoendturn", () => {
    $("#Endturn").RemoveClass("Hidden");
    $("#DiceRoll").AddClass("Hidden");
});

GameEvents.Subscribe("monopolis_diceroll", event => {
    ($("#dice1") as LabelPanel).text = event.dice1.toFixed(0);
    ($("#dice2") as LabelPanel).text = event.dice2.toFixed(0); 
    $("#DiceRoll").RemoveClass("Hidden");
})

GameEvents.Subscribe("monopolis_startturn", () => {
    $("#RollDiceButton").RemoveClass("Hidden");
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
    let existingPanel = $(`#MoneyTable_${pID}`);
    if (!existingPanel) {
        existingPanel = $.CreatePanel("Panel", $("#MoneyTable"), `#MoneyTable_${pID}`);
        existingPanel.BLoadLayoutSnippet("MoneyTableRow");

        (existingPanel.FindChildTraverse("Image") as AvatarImage).steamid = Game.GetPlayerInfo(Number.parseInt(pID) as PlayerID).player_steamid;
        (existingPanel.FindChildTraverse("Name") as UserName).steamid = Game.GetPlayerInfo(Number.parseInt(pID) as PlayerID).player_steamid;
    }
    (existingPanel.FindChildTraverse("GoldAmount") as LabelPanel).text = state.money.toFixed(0);
});