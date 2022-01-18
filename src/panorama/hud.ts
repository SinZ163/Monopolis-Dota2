const MOVEMENT_SCHEDULE_TIMER = 0.1;

SubscribeNetTableKey("misc", "price_definition", tilesObj => {
    $.Msg("Property Definition Listener firing");
    let purchasabletiles = Object.entries(tilesObj).filter(([k,v]) => v.type === "property" || v.type === "railroad" || v.type === "utility") as Array<[PurchasableTiles, NetworkedData<PropertyDefinition|RailroadDefinition|UtilityDefinition>]>;
    for (let [tileStr, tileInfo] of purchasabletiles.sort((a,b) => (a[1].categoryId - b[1].categoryId) === 0 ? a[1].index - b[1].index : a[1].categoryId - b[1].categoryId)) {

        if (tileInfo.type !== "property" && tileInfo.type !== "railroad" && tileInfo.type !== "utility") {
            continue;
        }
        let tile = tileStr as PurchasableTiles;

        let panel = $.CreatePanel("Panel", $("#PropertyManagement"), `PropertyManagement_${tile}`);
        panel.BLoadLayoutSnippet("PropertyManagementRow");
        (panel.FindChildTraverse("PropertyName") as LabelPanel).text = $.Localize(`#tile_${tile}`);
        panel.FindChildTraverse("BuyHouse")?.SetPanelEvent("onactivate", () => AddHouse(tile));
        panel.FindChildTraverse("SellHouse")?.SetPanelEvent("onactivate", () => RemoveHouse(tile));
        let colourPanel = panel.FindChildTraverse("PropertyColour");
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
        for (let pID of Game.GetAllPlayerIDs()) {
            let playerPropertyContainer = $(`#MoneyPropertyContainer_${pID}`);
            const categoryContainerId = `MoneyPropertyContainer_${pID}_${tileInfo.categoryId}`;
            let existingCategoryContainer = playerPropertyContainer.FindChildTraverse(categoryContainerId);
            if (!existingCategoryContainer) {
                existingCategoryContainer = $.CreatePanel("Panel", playerPropertyContainer, categoryContainerId);
                existingCategoryContainer.AddClass("MoneyPropertyCategoryContainer");
            }
            let propTile = $.CreatePanel("Panel", existingCategoryContainer, `MoneyProperty_${pID}_${tile}`);
            propTile.AddClass(`MoneyPropertyCategoryCell`);
            propTile.AddClass(tileInfo.type === "property" ? tileInfo.category : tileInfo.type);
            
            const categoryTradeContainerId = `TradePlayerSlot_${pID}_${tileInfo.categoryId}`;
            let tradePropertyContainer = $(`#TradePropertyContainer_${pID}`);
            let existingTradeCategoryContainer = tradePropertyContainer.FindChildTraverse(categoryTradeContainerId);
            if (!existingTradeCategoryContainer) {
                existingTradeCategoryContainer = $.CreatePanel("Panel", tradePropertyContainer, categoryTradeContainerId);
                existingTradeCategoryContainer.AddClass("TradePlayerSlotCategoryContainer");
            }
            let tradeTile = $.CreatePanel("Panel", existingTradeCategoryContainer, `TradeProperty_${pID}_${tile}`);
            tradeTile.SetDraggable(true);
            tradeTile.AddClass(`TradePropertyCategoryCell`);
            tradeTile.AddClass(tileInfo.type === "property" ? tileInfo.category : tileInfo.type);
            $.RegisterEventHandler("DragStart", tradeTile, OnTradePropertyDragStart);
            $.RegisterEventHandler("DragEnd", tradeTile, OnTradePropertyDragEnd);
            (tradeTile.Data() as any).category = tileInfo.type === "property" ? tileInfo.category : tileInfo.type;
            (tradeTile.Data() as any).tile = tile;
            (tradeTile.Data() as any).pID = pID;
            (existingTradeCategoryContainer.Data() as any).pID = pID;
        }
        OnPropertyChanged(tile, CustomNetTables.GetTableValue("property_ownership", tile));
    }
});

SubscribeNetTableKey("misc", "auction", value => {
    let currentPlayerColor = ColorToHexCode2(Players.GetPlayerColor(value.current_bidder));
    $("#AuctionButtons").style.backgroundColor = `gradient ( linear, 0% 100%, 100% 0%, from( #00000000 ), to( ${currentPlayerColor} ) );`;
    ($("#AuctionButtons").style as any).backgroundColorOpacity = 1.0;
    //$("#AuctionButtons").style.backgroundColor = `gradient( radial, 50% 50%, 0% 0%, 20% 20%, from( #000000ff ), to( ${currentPlayerColor}ff ) );`;
    let historicalBidCount = $("#AuctionScreen").GetAttributeInt("historicalBids", 0);
    ($("#AuctionValueText") as LabelPanel).text = value.current_bid.toFixed(0);
    let bids = toArray(value.historical_bids);
    if (historicalBidCount > bids.length) {
        $("#BidHistory").RemoveAndDeleteChildren();
        historicalBidCount = 0;
    }
    for (let bidId = historicalBidCount; bidId < bids.length; bidId++) {
        let bid = bids[bidId];

        let bidPanel = $.CreatePanel("Panel", $("#BidHistory"), `Bid_${bidId}`);
        bidPanel.BLoadLayoutSnippet("AuctionBidHistoryRow");
        bidPanel.AddClass("Bid");
        bidPanel.style.backgroundColor = ColorToHexCode2(Players.GetPlayerColor(bid.pID));
        $.Schedule(0, () => bidPanel.AddClass("Bid" + bid.amount));

        (bidPanel.FindChildTraverse("AuctionBidAvatar") as AvatarImage).steamid = Game.GetPlayerInfo(bid.pID).player_steamid;
        (bidPanel.FindChildTraverse("AuctionBidName") as UserName).steamid = Game.GetPlayerInfo(bid.pID).player_steamid;
        (bidPanel.FindChildTraverse("AuctionBidLabel") as LabelPanel).text = $.Localize("monopolis_auction_bid" + bid.amount);
    }
    $("#AuctionScreen").SetAttributeInt("historicalBids", bids.length);

});
function OnPropertyChanged(tile: PurchasableTiles, value: PropertyOwnership) {
    let existingPanel = $(`#PropertyManagement_${tile}`);
    if (!existingPanel) {
        return;
    }

    // default to -2 so the -1's coming in from unowned cause the handler to run
    let currentOwner = existingPanel.GetAttributeInt("current_owner", -2);
    if (value.owner !== currentOwner) {
        existingPanel.RemoveClass(`Owner_${currentOwner}`);
        existingPanel.AddClass(`Owner_${value.owner}`);
        existingPanel.SetAttributeInt("current_owner", value.owner);
    }
    for (let pID of Game.GetAllPlayerIDs()) {
        let playerTile = $(`#MoneyProperty_${pID}_${tile}`);
        playerTile.SetHasClass("Unowned", value.owner === -1);
        playerTile.SetHasClass("Hotel", value.owner === pID && value.houseCount === 5);
        playerTile.SetHasClass("House", value.owner === pID && value.houseCount > 0 && value.houseCount < 5);
        playerTile.SetHasClass("Owner", value.owner === pID && value.houseCount === 0);
        playerTile.SetHasClass("Mortgaged", value.owner === pID && value.houseCount === -1);
        playerTile.SetHasClass("Owned", value.owner > -1 && value.owner !== pID);
        let tradeTile = $(`#TradeProperty_${pID}_${tile}`);
        tradeTile.SetHasClass("Unowned", value.owner === -1);
        tradeTile.SetHasClass("Hotel", value.owner === pID && value.houseCount === 5);
        tradeTile.SetHasClass("House", value.owner === pID && value.houseCount > 0 && value.houseCount < 5);
        tradeTile.SetHasClass("Owner", value.owner === pID && value.houseCount === 0);
        tradeTile.SetHasClass("Mortgaged", value.owner === pID && value.houseCount === -1);
        tradeTile.SetHasClass("Owned", value.owner > -1 && value.owner !== pID);
    }
    // TODO: Proper naming convention for houses / hotels
    // TODO: Block + and - buttons in correct conditions
    let text = "";
    switch (value.houseCount) {
        case 5: 
            text = "monopolis_propertymanagement_hotel";
            break;
        case 4:
        case 3:
        case 2:
        case 1:
            existingPanel.FindChildTraverse("PropertyStatus")?.SetDialogVariableInt("houseCount", value.houseCount);
            text = "monopolis_propertymanagement_houses";
            break;
        case 0:
            text = "monopolis_propertymanagement_owned"
            break;
        case -1:
            text = "monopolis_propertymanagement_mortgaged";
            break;
    }
    let propertyStatus = (existingPanel.FindChildTraverse("PropertyStatus") as LabelPanel);
    propertyStatus.text = $.Localize(text, propertyStatus);
}

SubscribeNetTableKey("misc", "ui_state", state => {
    let currentState = $.GetContextPanel().GetAttributeString("currentuistate", "undefined");
    $.Msg("UI Listener", currentState, state);
    if (currentState !== "undefined") {
        $.GetContextPanel().RemoveClass(currentState);
    }
    let type = "UI" + state.type.replace("/", "");
    $.GetContextPanel().AddClass(type);
    $.GetContextPanel().SetAttributeString("currentuistate", type);

});

SubscribeNetTableKey("misc", "current_turn", turnState => {
    let currentState = $.GetContextPanel().GetAttributeString("currentstate", "undefined");
    $.Msg(currentState, "|", turnState.type);

    if (currentState !== "undefined") {
        $.GetContextPanel().RemoveClass(currentState);
    }
    
    $.GetContextPanel().AddClass(turnState.type);
    $.GetContextPanel().SetAttributeString("currentstate", turnState.type);

    let currentTurn = $.GetContextPanel().GetAttributeInt("currentturn", -1);
    if (turnState.pID !== currentTurn) {
        $.GetContextPanel().RemoveClass("JailDice");
        $.GetContextPanel().RemoveClass("SellStuffRequired");
        $.GetContextPanel().RemoveClass("JailPreRolled");
        $.GetContextPanel().RemoveClass(`Turn_${currentTurn}`);
        $.GetContextPanel().AddClass(`Turn_${turnState.pID}`);
        $.GetContextPanel().SetAttributeInt("currentturn", turnState.pID);

        let movementSchedule = $.GetContextPanel().GetAttributeInt("movementSchedule", -1);
        try {
            $.Msg("Cancelling existing movement");
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
            $.Msg("Attempting to cancel movement due to turn being over");
            let movementSchedule = $.GetContextPanel().GetAttributeInt("movementSchedule", -1);
            if (movementSchedule > -1) {
                $.CancelScheduled(movementSchedule as ScheduleID);
            }
        }
    } catch {}

    if (turnState.type === "diceroll" || turnState.type === "auxroll_result") {
        ($("#dice1") as LabelPanel).text = turnState.dice1.toFixed(0);
        ($("#dice2") as LabelPanel).text = turnState.dice2.toFixed(0);
        if (isDoubles) {
            ($("#endturnLabel") as LabelPanel).text = $.Localize("reroll");
        } else {
            ($("#endturnLabel") as LabelPanel).text = $.Localize("endturn");
        }
    }
    let playerState = CustomNetTables.GetTableValue("player_state", turnState.pID.toFixed(0));

    switch(turnState.type) {
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
            if (turnState.price > playerState.money) {
                $.GetContextPanel().AddClass("SellStuffRequired");
            }
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
        case "auxroll_result":
            let colourClass = "";
            $("#CardResultButton").RemoveClass("green");
            $("#CardResultButton").RemoveClass("red");

            // Set colours
            switch(turnState.card.type) {
                case "money_gain":
                case "money_gain_others":
                case "fuckjail":
                    colourClass = "green";
                    break;
                case "jail":
                case "repairs":
                case "money_lose":
                case "money_lose_others":
                    colourClass = "red";
                    break;
                case "teleport_category":
                    if (turnState.type === "auxroll_result") {
                        colourClass = "red";
                    }
                    break;
            }
            // Functional logic
            switch(turnState.card.type) {
                case "money_gain":
                case "money_gain_others":
                case "money_lose":
                case "money_lose_others":
                    $("#CardResultText").SetDialogVariableInt("value", turnState.card.value);
                    $("#CardResultButtonText").SetDialogVariableInt("value", turnState.card.value);
                    break;
                case "repairs":
                    $("#CardResultText").SetDialogVariableInt("house", turnState.card.house);
                    $("#CardResultText").SetDialogVariableInt("hotel", turnState.card.hotel);
                    break;
                case "teleport":
                    $("#CardResultText").SetDialogVariableLocString("dest", "tile_" + turnState.card.dest);
                    break;
                case "teleport_relative":
                    $("#CardResultText").SetDialogVariableInt("value", Math.abs(turnState.card.value));
                    $("#CardResultButtonText").SetDialogVariableInt("value", Math.abs(turnState.card.value));
                    break;
                case "teleport_category":
                    if (turnState.type === "auxroll_result") {
                        $("#CardResultButtonText").SetDialogVariableInt("price", turnState.value);
                    }
            }
            if (turnState.card.type === "money_lose" || turnState.card.type === "money_lose_others") {
                let value = turnState.card.value;
                if (turnState.card.type === "money_lose_others") {
                    let playerStates = CustomNetTables.GetAllTableValues("player_state");
                    let aliveOthers = playerStates.filter(player => player.value.pID !== turnState.pID && player.value.alive === 1);
                    value = value * aliveOthers.length;
                }
                if (value > playerState.money) {
                    $.GetContextPanel().AddClass("SellStuffRequired");
                }
            }
            if (turnState.type === "auxroll_result" && turnState.value > playerState.money) {
                $.GetContextPanel().AddClass("SellStuffRequired");
            }
            // TODO: Repairs
            let text: string;
            if (turnState.type === "auxroll_result") {
                text = $.Localize("payrent", $("#CardResultButtonText"));
            } else {
                text = $.Localize("card_" + turnState.card.type, $("#CardResultButtonText"));
            }
            ($("#CardResultButtonText") as LabelPanel).text = text;
            let resultText = $.Localize(turnState.card.text, $("#CardResultText"));
            ($("#CardResultText") as LabelPanel).text = resultText;
            if (colourClass !== "") {
                $("#CardResultButton").AddClass(colourClass);
            }
            break;
        case "endturn":
            $.Msg(playerState);
            if (playerState.jailed > 0 && playerState.jailed < 3) {
                $.GetContextPanel().AddClass("JailDice");
                let diceRolls = toArray(turnState.rolls);
                ($("#dice1") as LabelPanel).text = diceRolls[diceRolls.length - 1].dice1.toFixed(0);
                ($("#dice2") as LabelPanel).text = diceRolls[diceRolls.length - 1].dice2.toFixed(0);
            }
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

function Bankrupt() {
    GameEvents.SendCustomGameEventToServer("monopolis_requestbankrupt", {});
}

function StartTrade() {
    GameEvents.SendCustomGameEventToServer("monopolis_requesttrade", {});
}

function DrawCard() {
    $.Msg("Draw card?");
    GameEvents.SendCustomGameEventToServer("monopolis_requestcard", {});
}
function AcknowledgeCard() {
    GameEvents.SendCustomGameEventToServer("monopolis_acknowledgecard", {});
}

function AuctionBid(bidAmount: number) {
    $.Msg(bidAmount, typeof bidAmount);
    if (bidAmount !== 10 && bidAmount !== 50 && bidAmount !== 100) {
        return;
    }
    GameEvents.SendCustomGameEventToServer("monopolis_auctionbid", {amount: bidAmount});
}
function AuctionWithdraw() {
    $.Msg("Withdraw");
    GameEvents.SendCustomGameEventToServer("monopolis_auctionwithdraw", {});
}

let players = Game.GetAllPlayerIDs();
for (let pID of players) {
    let existingPanel = $(`#MoneyTable_${pID}`);
    if (!existingPanel) {
        $.Msg("MoneyTable for pID", pID, "deos not exist?");
        existingPanel = $.CreatePanel("Panel", $("#MoneyTable"), `MoneyTable_${pID}`);
        existingPanel.BLoadLayoutSnippet("MoneyTableRow");

        (existingPanel.FindChildTraverse("Image") as AvatarImage).steamid = Game.GetPlayerInfo(pID).player_steamid;
        (existingPanel.FindChildTraverse("Name") as UserName).steamid = Game.GetPlayerInfo(pID).player_steamid;
        var propertyContainer = $.CreatePanel("Panel", existingPanel, `MoneyPropertyContainer_${pID}`);
        propertyContainer.AddClass("MoneyPropertyContainer");
    }
    let existingTradePanel = $(`#TradePlayerSlot_${pID}`);
    if (!existingTradePanel) {
        $.Msg("TradePlayerSlot for pID", pID, "does not exist?", );
        existingTradePanel = $.CreatePanel("Panel", $("#TradePlayerSlots"), `TradePlayerSlot_${pID}`);
        existingTradePanel.BLoadLayoutSnippet("TradePlayerSlotEntry");

        (existingTradePanel.FindChildTraverse("PlayerImage") as AvatarImage).steamid = Game.GetPlayerInfo(pID).player_steamid;
        (existingTradePanel.FindChildTraverse("PlayerName") as UserName).steamid = Game.GetPlayerInfo(pID).player_steamid;
        var propertyContainer = $.CreatePanel("Panel", existingTradePanel, `TradePropertyContainer_${pID}`);
        propertyContainer.AddClass("TradePropertyContainer");
        $.RegisterEventHandler("DragEnter", propertyContainer, OnTradePropertyDragEnter);
        $.RegisterEventHandler("DragLeave", propertyContainer, OnTradePropertyDragLeave);
        $.RegisterEventHandler("DragDrop", propertyContainer, OnTradePropertyDragDrop);
        (propertyContainer.Data() as any).pID = pID;
        var moneyContainer = existingTradePanel.FindChildTraverse("TransferMoney") as NumberEntry;
        $.RegisterEventHandler("DragStart", moneyContainer, OnTradeMoneyDragStart);
        $.RegisterEventHandler("DragEnd", moneyContainer, OnTradeMoneyDragEnd);
        (moneyContainer.Data() as any).pID = pID;
    }
}


SubscribeNetTableAll("player_state", (_, pID, state) => {
    $.Msg("Hud.ts", _, pID, state);
    let existingPanel = $(`#MoneyTable_${pID}`);
    if (!existingPanel) {
        $.Msg("Doesn't exist, wtf?!?");
    }
    (existingPanel.FindChildTraverse("GoldAmount") as LabelPanel).text = state.money.toFixed(0);
    existingPanel.style.borderColor = ColorToHexCode2(Players.GetPlayerColor(Number.parseInt(pID) as PlayerID));

    let currentTurn = $.GetContextPanel().GetAttributeInt("currentturn", -1);
    
    if (currentTurn === state.pID) {
        // Jailed people dont get to reroll
        if (state.jailed > 0) {
            ($("#endturnLabel") as LabelPanel).text = $.Localize("endturn");
        }
        let turnState = CustomNetTables.GetTableValue("misc", "current_turn");
        if (turnState.type === "payrent" && state.money >= turnState.price) {
            $.GetContextPanel().RemoveClass("SellStuffRequired");
        }
        else if (turnState.type === "card_result") {
            if (turnState.card.type === "money_lose" || turnState.card.type === "money_lose_others") { 
                let value = turnState.card.value;
                if (turnState.card.type === "money_lose_others") {
                    let playerStates = CustomNetTables.GetAllTableValues("player_state");
                    let aliveOthers = playerStates.filter(player => player.value.pID !== turnState.pID && player.value.alive === 1);
                    value = value * aliveOthers.length;
                }
                if (state.money >= value) {
                    $.GetContextPanel().RemoveClass("SellStuffRequired");
                }
            }
        }
        else if (turnState.type === "auxroll_result" && state.money >= turnState.value) {
            $.GetContextPanel().RemoveClass("SellStuffRequired");
        }
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

CustomNetTables.SubscribeNetTableListener("property_ownership", (_, tile, value) => OnPropertyChanged(tile, value));


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
    if (heroLoc) {

        const heroEntIndex = Players.GetPlayerHeroEntityIndex(currentTurn as PlayerID);
        GameUI.SetCameraTarget(heroEntIndex);

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
    }
    

    $.GetContextPanel().SetAttributeInt("movementSchedule", $.Schedule(MOVEMENT_SCHEDULE_TIMER, MovementSchedule));
}
