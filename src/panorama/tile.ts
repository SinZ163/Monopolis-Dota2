function SetImage(path: string) {
    let image = $("#Image") as ImagePanel;
    image.SetImage(path);
}

let tilename: PricedTiles;

let filename = $.GetContextPanel().GetParent()?.layoutfile;
if (filename) { 
    let tile = filename.split("\\")[filename.split("\\").length - 1];
    if (tile.endsWith(".xml")) {
        tilename = tile.substr(0, tile.length - 4) as PricedTiles;
    } else {
        throw "wtf";
    }
    switch (tilename) {
        case "brown1":
        case "brown2":
            $.GetContextPanel().AddClass("brown");
            break;
        case "teal1":
        case "teal2":
        case "teal3":
            $.GetContextPanel().AddClass("teal");
            break;
        case "magenta1":
        case "magenta2":
        case "magenta3":
            $.GetContextPanel().AddClass("magenta");
            break;
        case "orange1":
        case "orange2":
        case "orange3":
            $.GetContextPanel().AddClass("orange");
            break;
        case "red1":
        case "red2":
        case "red3":
            $.GetContextPanel().AddClass("red");
            break;
        case "yellow1":
        case "yellow2":
        case "yellow3":
            $.GetContextPanel().AddClass("yellow");
            break;
        case "green1":
        case "green2":
        case "green3":
            $.GetContextPanel().AddClass("green");
            break;
        case "blue1":
        case "blue2":
            $.GetContextPanel().AddClass("blue");
            break;
        case "railroad1":
        case "railroad2":
        case "railroad3":
        case "railroad4":
            SetImage("file://{images}/spellicons/techies_suicide.png");
            break;
        case "utility1":
            SetImage("file://{images}/spellicons/storm_spirit_electric_vortex.png");
            break;
        case "utility2":
            SetImage("file://{images}/spellicons/kunkka_torrent.png");
            break;
        case "tax1":
            SetImage("file://{images}/spellicons/roshan_halloween_angry.png");
            break;
        case "tax2":
            SetImage("file://{images}/spellicons/roshan_halloween_levels.png")
    }
    let spaceName = $("#SpaceName") as LabelPanel;
    spaceName.text = $.Localize("#tile_" + tilename);
}

GameEvents.Subscribe("monopolis_price_definitions", event => {
    let spacePrice = $("#SpacePrice") as LabelPanel;
    let tile = event[tilename];
    let price: number|undefined = undefined;
    if (tile.type === "tax") {
        let payText = $("#PaymentText") as LabelPanel;
        $.GetContextPanel().AddClass("HasPayment");
        payText.text = $.Localize("#pay");
        price = tile.cost;
    }
    if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
        price = tile.purchasePrice;
    }
    if (price !== undefined) {
        spacePrice.text = (price).toFixed(0);
    }
});
