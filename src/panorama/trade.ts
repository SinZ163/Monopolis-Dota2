function OnTradePropertyDragStart(panel: Panel, callback: any) {
    $.Msg("DragStart", panel);
    $.Msg("DragStart2", callback);
    if (panel.BHasClass("Owner")) {
        let displayPanel = $.CreatePanel("Panel", panel, "TradeDragImage");
        (displayPanel.Data() as any).tile = (panel.Data() as any).tile;
        (displayPanel.Data() as any).category = (panel.Data() as any).category;
        (displayPanel.Data() as any).pID = (panel.Data() as any).pID;
        displayPanel.AddClass((panel.Data() as any).category);
        displayPanel.AddClass("Owner");
        displayPanel.AddClass("TradePropertyCategoryCell");
        callback.displayPanel = displayPanel;
        callback.offsetX = 0;
        callback.offsetY = 0;
    }
    return true;
}
function OnTradePropertyDragEnd(panel: Panel, draggedPanel: Panel) {
    $.Msg("DragEnd", panel.id, panel.Data());
    $.Msg("DragEnd2", draggedPanel.id, draggedPanel.Data());
    draggedPanel.DeleteAsync(0);
    return true;
}
function OnTradePropertyDragEnter(panel: Panel, draggedPanel: Panel) {
    $.Msg("DragEnter", panel.id, panel.Data());
    $.Msg("DragEnter2", draggedPanel.id, draggedPanel.Data());
}
function OnTradePropertyDragLeave(panel: Panel, draggedPanel: Panel) {
    $.Msg("DragLeave", panel.id, panel.Data());
    $.Msg("DragLeave2", draggedPanel.id, draggedPanel.Data());
}
function OnTradePropertyDragDrop(panel: Panel, draggedPanel: Panel) {
    $.Msg("DragDrop", panel.id, panel.Data());
    $.Msg("DragDrop2", draggedPanel.id, draggedPanel.Data());
    let newPID: PlayerID = (panel.Data() as any).pID;
    let oldPID: PlayerID = (draggedPanel.Data() as any).pID;
    if (draggedPanel.BHasClass("TradePropertyCategoryCell")) {
        let tile: PurchasableTiles = (draggedPanel.Data() as any).tile;
        $.Msg(tile, oldPID, newPID);
        if (newPID !== oldPID) {
            GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "add_property", property: tile, from: oldPID, to: newPID});
        }
    } else if (draggedPanel.BHasClass("TradeMoneyCell")) {
        let value = (draggedPanel as NumberEntry).value;
        GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "add_money", money: value, from: oldPID, to: newPID});
    }
}

function OnTradeMoneyDragStart(panel: NumberEntry, callback: any) {
    let displayPanel = $.CreatePanel("NumberEntry", panel, "TradeDragMoney");
    displayPanel.value = panel.value;
    (displayPanel.Data() as any).pID = (panel.Data() as any).pID;
    displayPanel.AddClass("TradeMoneyCell");
    callback.displayPanel = displayPanel;
    callback.offsetX = 0;
    callback.offsetY = 0;
}
function OnTradeMoneyDragEnd(panel: Panel, draggedPanel: Panel) {
    draggedPanel.DeleteAsync(0);
    return true;
}

function TradeListener(tradeState: NetworkedData<TradeState>): void {
    $.Msg(tradeState);
    $("#TradeSummary").RemoveAndDeleteChildren();
    for (let [i, offer] of Object.entries(toArray(tradeState.offers))) {
        let panel = $.CreatePanel("Panel", $("#TradeSummary"), "TradeSummary_" + i);
        panel.BLoadLayoutSnippet("TradeOfferRow");
        (panel.FindChildTraverse("PlayerFromImage") as AvatarImage).steamid = Game.GetPlayerInfo(offer.from).player_steamid;
        (panel.FindChildTraverse("PlayerFromName") as UserName).steamid = Game.GetPlayerInfo(offer.from).player_steamid;
        (panel.FindChildTraverse("PlayerToImage") as AvatarImage).steamid = Game.GetPlayerInfo(offer.to).player_steamid;
        (panel.FindChildTraverse("PlayerToName") as UserName).steamid = Game.GetPlayerInfo(offer.to).player_steamid;

        let contentsPanel = panel.FindChildTraverse("TradeSummaryContents");
        if (!contentsPanel) return;
        
        if (offer.type === "property") {
            let propertyInfo = CustomNetTables.GetTableValue("misc", "price_definition")[offer.property];
            let propertyPanel = $.CreatePanel("Panel", contentsPanel, "TradePropertyContainer_"+i);

            propertyPanel.AddClass(propertyInfo.type === "property" ? propertyInfo.category : propertyInfo.type);
            let ownership = CustomNetTables.GetTableValue("property_ownership", offer.property);
            if (ownership.houseCount === 0) {
                propertyPanel.AddClass("Owner");
            } else {
                propertyPanel.AddClass("Mortgaged");
            }
            propertyPanel.AddClass("TradePropertyCategoryCell");
            contentsPanel.SetPanelEvent("onactivate", () => {
                GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "remove_property", property: (offer as PropertyTradeOffer).property});
            });
        } else if (offer.type === "money") {
            let moneyContainer = $.CreatePanel("Label", panel.FindChildTraverse("TradeSummaryContents")!, "TradeMoneyContainer_"+i);
            moneyContainer.html = true;
            moneyContainer.SetDialogVariableInt("money", offer.money);
            moneyContainer.AddClass("TradeMoneyText");
            moneyContainer.text = $.Localize("#monopolis_money", moneyContainer);
            contentsPanel.SetPanelEvent("onactivate", () => {
                let moneyOffer = offer as MoneyTradeOffer;
                GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "remove_money", money: moneyOffer.money, from: moneyOffer.from, to: moneyOffer.to});
            });
        }
    }
    let tradeConfirmContainer = $("#TradeConfirmation");
    tradeConfirmContainer.SetHasClass("Hidden", tradeState.status !== TradeStateStatus.Confirmation);
    if (tradeState.status === TradeStateStatus.Confirmation) {
        let tradeConfirmPlayerContainer = $("#TradeConfirmationStatus");
        tradeConfirmPlayerContainer.RemoveAndDeleteChildren();
        for (let participant of Object.values(tradeState.participants)) {
            let playerPanel = $.CreatePanel("Panel", tradeConfirmPlayerContainer, "TradeConfirmPlayerSlot_" + participant);
            playerPanel.BLoadLayoutSnippet("TradeConfirmationSlot");
            playerPanel.SetHasClass("Accepted", tradeState.confirmations[participant] === 1);
            playerPanel.SetHasClass("Rejected", tradeState.confirmations[participant] === 0);
            (playerPanel.FindChildTraverse("PlayerImage") as AvatarImage).steamid = Game.GetPlayerInfo(participant).player_steamid;
        }
    }
}

function TradeConfirm() {
    GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "confirm"});
}
function TradeCancel() {
    GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "cancel"});
}
function TradeAccept() {
    GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "accept"});
}
function TradeReject() {
    GameEvents.SendCustomGameEventToServer("monopolis_trade", {type: "reject"});
}