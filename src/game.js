var SERVER_URL = "http://hunter.stanislavmalchev.com/remotehost/";
/**
 * Created by stanislav.malchev on 2/7/2017.
 */
var game = {
    player: {},
    world: {},
    area: {
        id: 0
    },
    party: {

    },
    characters: {},
    items: {},
    rules: {
        player: {
            GAME_STATES: {
                HQ: 0,
                WORLD: 1,
                MISSION: 2
            }
        },
        characters: {
            EQUIP_SLOTS: {
                BODY: "body",
                MAIN: "main"
            }
        }
    },
    engine: {
        area: {
            map: null,
            spawning_points: {},

        },
        characters: {},
        fn: {
            characters: {
                moveSE: function (char_id) {
                    game.engine.fn.characters.moveInDir(char_id, "se")
                },
                moveE: function (char_id) {
                    game.engine.fn.characters.moveInDir(char_id, "e")
                },
                moveInDir: function(id, dir) {
                    var map = game.engine.area.map;
                    var char = game.characters[id];
                    char.dir = dir;

                    switch (dir) {
                        case "e":
                            game.characters[id].x++;
                            game.characters[id].y--;
                            break;
                        case "se":
                            game.characters[id].x++;
                            // game.characters[id].y++;
                            break;
                    }

                    var tilePositionTarget = map.tilePosToPixelPos(game.characters[id].x, game.characters[id].y);

                    game.engine.characters[id].sprite.runAction(game.engine.characters[id].actions.move.action[dir]);
                    var move = cc.moveTo(1.0, cc.p(tilePositionTarget.x, tilePositionTarget.y));

                    var seq = cc.sequence(
                        move
                        ,cc.callFunc(function () {
                            cc.log('Ended');
                            game.engine.characters[id].sprite.stopAllActions();
                            game.engine.characters[id].sprite.runAction(game.engine.characters[id].actions.idle.action[dir]);
                        })
                    );
                    game.engine.characters[id].sprite.runAction(seq);
                },
                followPath: function (path, id) {
                    var map = game.engine.area.map;
                    var char = game.characters[id];
                    char.dir = dir;

                    switch (dir) {
                        case "e":
                            game.characters[id].x++;
                            game.characters[id].y--;
                            break;
                        case "se":
                            game.characters[id].x++;
                            // game.characters[id].y++;
                            break;
                    }

                    console.log(path);

                    var actions = [];
                    for (var i=0; i<path.length;i++) {
                        var step = path[i];
                        var tilePositionTarget = map.tilePosToPixelPos(step[0], step[1]);
                        var move = cc.moveTo(1.0, cc.p(tilePositionTarget.x, tilePositionTarget.y));
                        actions.push(move);
                    }

                    var end = cc.callFunc(function () {
                        cc.log('Ended');
                        game.engine.characters[id].sprite.stopAllActions();
                        game.engine.characters[id].sprite.runAction(game.engine.characters[id].actions.idle.action[dir]);
                    });

                    actions.push(end);
                    console.log(actions);
                    game.characters[id].x = step[0];
                    game.characters[id].y = step[1];
                    game.engine.characters[id].sprite.runAction(game.engine.characters[id].actions.move.action[dir]);

                    var seq = cc.sequence(
                        actions

                    );
                    game.engine.characters[id].sprite.runAction(seq);
                }
            }
        }
    },
    fn: {
        init: function () {
            game.fn.player.init();
            game.fn.items.init();
            game.fn.characters.init();
        },
        player: {
            init: function () {
                game.fn.player.loadPlayer();
            },
            loadPlayer: function () {
                var url = SERVER_URL + "player/";
                cc.loader.loadJson(url, function(err, results){
                    if(err){
                        cc.log("Failed to load %s.", url);
                        return;
                    }
                    game.player = results;
                });
            }
        },
        area: {
            init: function () {
                game.fn.area.loadArea();
            },
            loadArea: function () {
                var url = SERVER_URL + "area/";
                cc.loader.loadJson(url, function(err, results){
                    if(err){
                        cc.log("Failed to load %s.", url);
                        return;
                    }
                    game.area = results;
                });
            },
            getHardMap: function (tiles, map_width) {
                var ret = [];
                if (!tiles) {
                    return ret;
                }
                for (var i=0;i<tiles.length;i++) {
                    if (tiles[i] !== 0) {
                        var y = Math.floor( i / map_width);
                        var x = i - y*map_width;
                        var obj = {
                            x:x, 
                            y:y,
                            gid: tiles[i]
                        };
                        ret.push(obj);
                    }
                }
                return ret;
            },
            makeMatrix: function (tiles, map_width) {
                var ret = [];
                if (!tiles) {
                    return ret;
                }
                var row = [];
                var col = 0;
                for (var i=0;i<tiles.length;i++) {
                    if (row.length == map_width) {
                        ret.push(row);
                        row = [];
                    }

                    if (tiles[i] !== 0) {
                        row.push(1);
                    } else {
                        row.push(0);
                    }
                }
                return ret;
            }
        },
        items: {
            init: function () {
                game.fn.items.loadItems();
            },
            loadItems: function () {
                var url = SERVER_URL + "items/";
                cc.loader.loadJson(url, function(err, results){
                    if(err){
                        cc.log("Failed to load %s.", url);
                        return;
                    }
                    var items = results;
                    for (var i=0;i < items.length;i++) {
                        var item = items[i];
                        game.items[item.id] = item;
                    }
                });
            }
        },
        characters: {
            init: function () {
                game.fn.characters.loadCharacters();
            },
            loadCharacters: function () {
                var url = SERVER_URL + "characters/";
                cc.loader.loadJson(url, function(err, results){
                    if(err){
                        cc.log("Failed to load %s.", url);
                        return;
                    }
                    var chars = results;
                    for (var i=0;i < chars.length;i++) {
                        var char = chars[i];
                        game.characters[char.id] = char;
                        game.engine.characters[char.id] = {};
                        game.fn.characters.updateCharSkin(char.id);
                        /*if (game.player.game_state === game.rules.player.GAME_STATES.HQ
                            || game.player.game_state === game.rules.player.GAME_STATES.MISSION)
                        {
                            // game.engine.fn.characters.createSprite(char.id);
                        }*/
                    }
                });
            },
            updateCharSkin: function (id) {
                var skin = null;
                var armor = game.fn.characters.getArmor(id);
                var weapon = game.fn.characters.getWeapon(id);
                if (armor) {
                    skin = armor.skin;
                }
                if (weapon) {
                    skin += "_" + weapon.skin;
                }
                game.characters[id].skin = skin;
            },
            getArmor: function (id) {
                return game.fn.characters.getItemEquippedToSlot(id, game.rules.characters.EQUIP_SLOTS.BODY)
            },
            getWeapon: function (id) {
                return game.fn.characters.getItemEquippedToSlot(id, game.rules.characters.EQUIP_SLOTS.MAIN)
            },
            getItemEquippedToSlot: function (char_id, slot) {
                var ret = null;
                var equipped_items = game.fn.characters.getEquippedItems(char_id);
                if (equipped_items) {
                    for (i in equipped_items) {
                        if (equipped_items[i].slot == slot) {
                            return equipped_items[i];
                        }
                    }
                }
                return ret;
            },
            getEquippedItems: function (char_id) {
                var ret = [];
                for (i in game.items) {
                    if (game.items[i].char_id == char_id && game.items[i].equipped === true) {
                        ret.push(game.items[i]);
                    }
                }
                return ret;
            }
        }
    }
};