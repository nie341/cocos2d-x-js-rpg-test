/**
 * Created by stanislav.malchev on 2/7/2017.
 */

var AreaMapLayer = cc.Layer.extend({

    ctor:function () {
        this._super();

        game.engine.area.map_layer = this;
        this.debug_mark_layer_center();

        this.loadMap();

        this.loadCharacters();

        this.initListeners();

        return true;
    },

    debug_mark_layer_center: function () {
        this.debug_draw_dot(this, cc.p(0, 0));
    },

    debug_draw_dot: function(node, p) {
        var draw = new cc.DrawNode();
        node.addChild(draw, 10);
        draw.drawDot(p, 40, cc.color(0, 0, 255, 128));
    },

    loadMap: function () {
        game.engine.area.map = new cc.TMXTiledMap(res.maps_ships_corvette);
        var map = game.engine.area.map;

        //hide meta layers
        map.getLayer("SpawnLayer").setVisible(false);

        // this.addChild(map, 0, TAG_TILE_MAP);
        var ms = map.getMapSize();
        var ts = map.getTileSize();
        map.x = 0 - (ms.width * ts.width / 2);
        map.y = 0 - (ms.height * ts.height / 2) ;

        this.addChild(game.engine.area.map, 0, TAG_TILE_MAP);
    },

    loadCharacters: function () {
        this.getSpawnPoints();

        var n = 0;
        for (i in game.characters) {
            this.loadCharacter(game.characters[i].id, n);
            n++;
        }
    },

    loadCharacter: function (id, n) {
        // create sprite sheet
        cc.spriteFrameCache.addSpriteFrames(res.units_sentinel_blue_weapon_alien_plasma_rifle_run_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.units_sentinel_blue_weapon_alien_plasma_rifle_run_png);
        this.addChild(this.spriteSheet);

        cc.spriteFrameCache.addSpriteFrames(res.units_sentinel_blue_weapon_alien_plasma_rifle_idle_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.units_sentinel_blue_weapon_alien_plasma_rifle_idle_png);
        this.addChild(this.spriteSheet);

        game.engine.characters[id] = {
            sprite: null,
            animations: {
                idle: {},
                run: {}
            },
            actions: {
                idle: {},
                run: {}
            }
        };

        var animFrames = [];
        for (var i = 0; i < 15; i++) {
            var str = "run_e_" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        game.engine.characters[id].animations.run.e = new cc.Animation(animFrames, 0.1);
        game.engine.characters[id].actions.run.e = new cc.RepeatForever(new cc.Animate(game.engine.characters[id].animations.run.e));        var animFrames = [];

        for (var i = 0; i < 15; i++) {
            var str = "run_se_" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        game.engine.characters[id].animations.run.se = new cc.Animation(animFrames, 0.1);
        game.engine.characters[id].actions.run.se = new cc.RepeatForever(new cc.Animate(game.engine.characters[id].animations.run.se));

        var animFrames = [];
        var str = "idle_se.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        animFrames.push(frame);
        game.engine.characters[id].animations.idle.se = new cc.Animation(animFrames, 1);
        game.engine.characters[id].actions.idle.se = new cc.Repeat(new cc.Animate(game.engine.characters[id].animations.idle.se), 0);

        var animFrames = [];
        var str = "idle_e.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        animFrames.push(frame);
        game.engine.characters[id].animations.idle.e = new cc.Animation(animFrames, 1);
        game.engine.characters[id].actions.idle.e = new cc.Repeat(new cc.Animate(game.engine.characters[id].animations.idle.e), 0);

        game.engine.characters[id].sprite = new cc.Sprite(res["units_" + game.characters[id].skin + "_idle_png"]);
        var map = game.engine.area.map;
        map.addChild(game.engine.characters[id].sprite, map.children.length);

        game.engine.characters[id].sprite.attr({
            width: 120,//TODO Get from skin
            height: 120,//TODO Get from skin
            anchorX: 0.5,
            anchorY: 0.25
        });

        if (typeof game.engine.area.spawning_points[n] === "undefined") {
            return;
        }
        var spawning_point = game.engine.area.spawning_points[n];
        game.characters[id].x = spawning_point.x;
        game.characters[id].y = spawning_point.y;

        spawning_point.map_pos = map.tilePosToPixelPos(spawning_point.x, spawning_point.y);
        game.engine.characters[id].sprite.runAction(game.engine.characters[id].actions.idle.se);
        this.spriteSheet.addChild(game.engine.characters[id].sprite);
        game.engine.characters[id].sprite.setPosition(cc.p(spawning_point.map_pos.x, spawning_point.map_pos.y));
    },

    initListeners: function () {
        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function(event){

                    cc.log("Mouse Raw Position: " + event.getLocation().x + ", " + event.getLocation().y);
                    var map = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);

                    /*
                     game.engine.area.spawning_points = map.getObjectGroup('SpawnLayer').getObjects();
                     var pp = cc.p(game.engine.area.spawning_points[0].x, game.engine.area.spawning_points[0].y);
                     cc.log("first spawn point on map:");
                     cc.log(pp);
                     var wpp = map.convertToWorldSpace(pp);
                     cc.log("first spawn point on world:");
                     cc.log(wpp);*/

                    // var sprite = map.getChildByTag(TAG_PLAYER);
                    var map_position = map.convertTouchToNodeSpace(event);

                    cc.log("Map node position" + map_position.x + ", " + map_position.y);
                    var tilePosition = map.PixelPosToTilePos(map_position.x, map_position.y);
                    cc.log( tilePosition);

                    // var tt = map.getLayer('FloorLayer').getTileAt(cc.p(tilePosition.x, tilePosition.y));
                    // map.removeChild(tt, true);
                    // cc.log( tt.getTexture() );
                    if (tilePosition.x < map.mapWidth
                        && tilePosition.x >= 0
                        && tilePosition.y < map.mapHeight
                        && tilePosition.y >= 0
                    ) {
                        var tilePositionTarget = map.tilePosToPixelPos(tilePosition.x, tilePosition.y);
                        //TODO try getPositionAt instead of tilePosToPixelPos
                        // game.engine.characters[0].sprite.x = tilePositionTarget.x;
                        // game.engine.characters[0].sprite.y = tilePositionTarget.y;
                        var floor = map.getLayer('FloorLayer');
                        // var tt = floor.getTileAt(cc.p(tilePosition.x, tilePosition.y));
                        // cc.log( floor.getTileGIDAt(cc.p(tilePosition.x, tilePosition.y)) );
                        // map.getLayer('FloorLayer').removeChild(tt, true);
                    }


                    // var selectedPos = this.map.tilePosToPixelPos(tilePosition.x, tilePosition.y);
                    // selectedPos.y -= this.map.getTileSize().height / 2;
                    // cc.log( selectedPos.x + ", " + selectedPos.y);
                },
                onMouseMove: function(event){
                    if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                        cc.log('pressed')
                        var node = event.getCurrentTarget();
                        // var node = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);
                        node.x += event.getDeltaX();
                        node.y += event.getDeltaY();
                    }
                }
            }, this);
        }
    },

    getSpawnPoints: function () {
        var map = game.engine.area.map;
        var spawn_layer = map.getLayer("SpawnLayer");
        var tile_gids = spawn_layer.getTiles();
        var ms = map.getMapSize();
        var hard_map = game.fn.area.getHardMap(tile_gids, ms.width);

        for (var i=0;i<hard_map.length;i++) {
            var tile_meta = map.getPropertiesForGID(hard_map[i].gid);
            if (typeof tile_meta.spawn_point !== "undefined") {
                var key = parseInt(tile_meta.spawn_point);
                game.engine.area.spawning_points[key] = hard_map[i];
            }
        }
    }
});

var KeyboardLayer = cc.Layer.extend({

    ctor:function () {
        this._super();
        var self = this;


        if ('keyboard' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (key, event) {
                    /*var strTemp = "Key down:" + key;
                     var keyStr = "";
                     if (key == cc.KEY.none) {

                     } else {
                     for (var keyTemp in cc.KEY) {
                     if (cc.KEY[keyTemp] == key) {
                     var keyStr = keyTemp;
                     }
                     }
                     }

                     // var keyStr = self.getKeyStr(key);
                     if (keyStr.length > 0) {
                     strTemp += " the key name is:" + keyStr;
                     }
                     cc.log(strTemp);*/
                },
                onKeyReleased: function (key, event) {
                    switch (key) {
                        case cc.KEY.num1:
                            cc.log('move player SW');
                            break;
                        case cc.KEY.num2:
                            cc.log('move player S');
                            break;
                        case cc.KEY.num3:
                            cc.log('move player SE');
                            var id = game.player.selected_character_id;
                            game.engine.fn.characters.moveSE(id);
                            break;
                        case cc.KEY.num4:
                            cc.log('move player W');
                            break;
                        case cc.KEY.num6:
                            var id = game.player.selected_character_id;
                            game.engine.fn.characters.moveE(id);
                            break;
                        case cc.KEY.num7:
                            cc.log('move player NW');
                            break;
                        case cc.KEY.num8:
                            cc.log('move player N');
                            break;
                        case cc.KEY.num9:
                            cc.log('move player NE');
                            break;

                    }

                    var strTemp = "Key up:" + key;
                    var keyStr = "";
                    if (key == cc.KEY.none) {

                    } else {
                        for (var keyTemp in cc.KEY) {
                            if (cc.KEY[keyTemp] == key) {
                                var keyStr = keyTemp;
                            }
                        }
                    }
                    if (keyStr.length > 0) {
                        strTemp += " the key name is:" + keyStr;
                    }
                    // cc.log(strTemp);
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }

        return true;
    }
});

var AreaScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var keyboard_layer = new KeyboardLayer();
        this.addChild(keyboard_layer);

        var layer = new GamePlayLayer();
        this.addChild(layer);
    }
});
