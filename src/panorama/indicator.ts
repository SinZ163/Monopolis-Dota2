let indicatorname: Tiles;

let indicatorFilename = $.GetContextPanel().GetParent()?.layoutfile;
if (indicatorFilename) { 
    let tile = indicatorFilename.split("\\")[indicatorFilename.split("\\").length - 1];
    if (tile.endsWith(".xml")) {
        indicatorname = tile.substr(0, tile.length - 4) as Tiles;
    } else {
        throw "wtf";
    }
} else {
    throw "wtf2";
}

CustomNetTables.SubscribeNetTableListener("property_ownership", (_, tile, value) => {
    if (tile !== indicatorname) return;
    $.Msg("Property Ownership changed", tile, value);
    if (value.owner > -1) {
        let colour = ColorToHexCode(Players.GetPlayerColor(value.owner));
        $.GetContextPanel().style.backgroundColor = colour;
    }
})


GameEvents.Subscribe("monopolis_startturn", event => {
    if (event.indicators[indicatorname] !== undefined) {
        $.GetContextPanel().RemoveClass("Hidden");
        ($("#IndicatorText") as LabelPanel).text = event.indicators[indicatorname]!.toFixed(0);
    }
});
GameEvents.Subscribe("monopolis_safetoendturn", () => {
    $.GetContextPanel().AddClass("Hidden");
});


function ColorToHexCode(color: number) {
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