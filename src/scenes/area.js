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
        var ms = map.getMapSize();
        var ts = map.getTileSize();

        //hide meta layers
        var collision_layer = map.getLayer("CollisionLayer");
        collision_layer.setVisible(false);
        var hard_map = game.fn.area.getHardMap(collision_layer.getTiles(), ms.width);
        game.engine.area.matrix = game.fn.area.makeMatrix(collision_layer.getTiles(), ms.width);
        // cc.log(hard_map);

        map.x = 0 - (ms.width * ts.width / 2);
        map.y = 0 - (ms.height * ts.height / 2) ;

        this.addChild(game.engine.area.map, 0, TAG_TILE_MAP);
    },

    loadCharacters: function () {
        // this.getSpawnPoints();

        var n = 0;
        for (i in game.characters) {
            this.loadCharacter(game.characters[i].id);
            n++;
        }
    },

    loadCharacter: function (id) {
        game.engine.characters[id] = cc.loader.getRes(res.units_sentinel_blue_weapon_alien_plasma_rifle_skin);

        for (action_name in game.engine.characters[id].actions) {
            game.engine.characters[id].actions[action_name].animation = {};
            game.engine.characters[id].actions[action_name].action = {};
            var action = game.engine.characters[id].actions[action_name];
            cc.spriteFrameCache.addSpriteFrames(action.plist);
            var spriteSheet = new cc.SpriteBatchNode(action.sprite_sheet);
            this.addChild(spriteSheet);

            for (dir in action.frames) {
                var frames_srcs = action.frames[dir];
                var animFrames = [];
                for (var i = 0; i < frames_srcs.length; i++) {
                    var frame = cc.spriteFrameCache.getSpriteFrame(frames_srcs[i]);
                    animFrames.push(frame);
                }
                var animation = new cc.Animation(animFrames, 0.1);
                game.engine.characters[id].actions[action_name].animation[dir] = animation;
                if (action.attr.repeat === true) {
                    game.engine.characters[id].actions[action_name].action[dir] = new cc.RepeatForever(new cc.Animate(animation));
                } else {
                    game.engine.characters[id].actions[action_name].action[dir] = new cc.Animate(animation);
                }
            }

        }

        game.engine.characters[id].sprite = new cc.Sprite(res["units_" + game.characters[id].skin + "_idle_png"]);
        var map = game.engine.area.map;
        map.addChild(game.engine.characters[id].sprite, map.children.length);

        game.engine.characters[id].sprite.attr({
            width: 120,//TODO Get from skin
            height: 120,//TODO Get from skin
            anchorX: 0.5,
            anchorY: 0.25
        });

        /*if (typeof game.engine.area.spawning_points[n] === "undefined") {
            return;
        }
        var spawning_point = game.engine.area.spawning_points[n];
        game.characters[id].x = spawning_point.x;
        game.characters[id].y = spawning_point.y;
        */
        var p = map.tilePosToPixelPos(game.characters[id].x, game.characters[id].y);
        game.engine.characters[id].sprite.runAction(game.engine.characters[id].actions.idle.action[game.characters[id].dir]);
        // this.spriteSheet.addChild(game.engine.characters[id].sprite);
        game.engine.characters[id].sprite.setPosition(cc.p(p.x, p.y));
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
                    cc.log("Clicked tile: " +  tilePosition.x, tilePosition.y);
                    cc.log("Selected character position: " +  game.characters[game.player.selected_character_id].x, game.characters[game.player.selected_character_id].y);

                    cc.log(game.engine.area.matrix);
                    var grid = new PF.Grid(game.engine.area.matrix);
                    var finder = new PF.AStarFinder({
                        allowDiagonal: true,
                        dontCrossCorners: true
                    });
                    var path = finder.findPath(
                        game.characters[game.player.selected_character_id].x,
                        game.characters[game.player.selected_character_id].y,
                        tilePosition.x,
                        tilePosition.y,
                        grid);

                    game.engine.fn.characters.followPath(path, game.player.selected_character_id);
                    // console.log(path);
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
                    var id = game.player.selected_character_id;
                    switch (key) {
                        case cc.KEY.num1:
                            cc.log('move player SW');
                            break;
                        case cc.KEY.num2:
                            cc.log('move player S');
                            break;
                        case cc.KEY.num3:
                            cc.log('move player SE');
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
