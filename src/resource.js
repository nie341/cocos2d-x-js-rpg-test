var res = {
    HelloWorld_png : "res/HelloWorld.png",
    man_sprite_png: "res/man_sprite.png",
    man_sprite_plist: "res/man_sprite.plist",
    tiles: "res/tiny_tiles.png",
    map_tmx: "res/tiny_map.tmx"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
