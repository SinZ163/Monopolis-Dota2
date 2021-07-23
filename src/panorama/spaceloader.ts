let file = "file://{resources}/layout/custom_game/space.xml"

if ($.GetContextPanel().layoutfile.indexOf("railroad") !== -1) {
    file = "file://{resources}/layout/custom_game/imagespace.xml"
}
if ($.GetContextPanel().layoutfile.indexOf("utility") !== -1) {
    file = "file://{resources}/layout/custom_game/imagespace.xml"
}
if ($.GetContextPanel().layoutfile.indexOf("tax") !== -1) {
    file = "file://{resources}/layout/custom_game/imagespace.xml"
}
$.CreatePanel("Panel", $.GetContextPanel(), $.GetContextPanel().layoutfile).BLoadLayout(file, false, false);