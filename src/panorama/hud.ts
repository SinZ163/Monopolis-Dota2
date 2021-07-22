$.Msg("Hud panorama loaded");

$.Msg($.GetContextPanel().layoutfile);

if ($.GetContextPanel().layoutfile.endsWith("brown1.xml")) {
    $.Msg("We found brown1");
    $.CreatePanel("Panel", $.GetContextPanel(), $.GetContextPanel().layoutfile).BLoadLayout("file://{resources}/layout/custom_game/worldpanels/space.xml", false, false);
}

let filename = $.GetContextPanel().GetParent()?.layoutfile;
$.Msg($.GetContextPanel().GetParent()?.layoutfile);
if (filename) { 
    let tile = filename.split("\\")[filename.split("\\").length - 1];
    $.Msg(tile);
    switch (tile) {
        case "brown1.xml":
        case "brown2.xml":
            $.GetContextPanel().AddClass("brown");
            break;
        case "teal1.xml":
        case "teal2.xml":
        case "teal3.xml":
            $.GetContextPanel().AddClass("teal");
            break;
        case "magenta1.xml":
        case "magenta2.xml":
        case "magenta3.xml":
            $.GetContextPanel().AddClass("magenta");
            break;
        case "orange1.xml":
        case "orange2.xml":
        case "orange3.xml":
            $.GetContextPanel().AddClass("orange");
            break;
        case "red1.xml":
        case "red2.xml":
        case "red3.xml":
            $.GetContextPanel().AddClass("red");
            break;
        case "yellow1.xml":
        case "yellow2.xml":
        case "yellow3.xml":
            $.GetContextPanel().AddClass("yellow");
            break;
        case "green1.xml":
        case "green2.xml":
        case "green3.xml":
            $.GetContextPanel().AddClass("green");
            break;
        case "blue1.xml":
        case "blue2.xml":
            $.GetContextPanel().AddClass("blue");
            break;
    }
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
