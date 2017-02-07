/**
 * Created by stanislav.malchev on 2/7/2017.
 */

var AreaMapLayer = cc.Layer.extend({
    spriteSheet: null,
    walkAction: null,

    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();
        var self = this;

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;




        this.loadMap();
        var map = game.engine.area.map;
        this.loadCharacters();

        // move map to the center of the screen
        var ms = map.getMapSize();
        var ts = map.getTileSize();
        // map.runAction(cc.moveTo(1.0, cc.p((size.width / 2) + (-ms.width * ts.width / 2), (size.height / 2) - (-ms.height , ts.height) )));
        map.x = (size.width / 2) + (-ms.width * ts.width / 2);
        map.y = (size.height / 2) + ( -ms.height * ts.height / 2) ;

        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function(event){

                    cc.log("Mouse Raw Position: " + event.getLocation().x + ", " + event.getLocation().y);
                    var map = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);
                    // var sprite = map.getChildByTag(TAG_PLAYER);
                    var position = map.convertTouchToNodeSpace(event);
                    cc.log( position);
                    var tilePosition = map.ScreenPosToTilePos(position.x, position.y);
                    cc.log( tilePosition);

                    // var tt = map.getLayer('FloorLayer').getTileAt(cc.p(tilePosition.x, tilePosition.y));
                    // map.removeChild(tt, true);
                    // cc.log( tt.getTexture() );
                    if (tilePosition.x < map.mapWidth
                        && tilePosition.x >= 0
                        && tilePosition.y < map.mapHeight
                        && tilePosition.y >= 0
                    ) {
                        var tilePositionTarget = map.tilePosToScreenPos(tilePosition.x, tilePosition.y);
                        game.engine.characters[0].sprite.x = tilePositionTarget.x;
                        game.engine.characters[0].sprite.y = tilePositionTarget.y;
                        var floor = map.getLayer('FloorLayer');
                        // var tt = floor.getTileAt(cc.p(tilePosition.x, tilePosition.y));
                        cc.log( floor.getTileGIDAt(cc.p(tilePosition.x, tilePosition.y)) );
                        // map.getLayer('FloorLayer').removeChild(tt, true);
                    }


                    // var selectedPos = this.map.tilePosToScreenPos(tilePosition.x, tilePosition.y);
                    // selectedPos.y -= this.map.getTileSize().height / 2;
                    // cc.log( selectedPos.x + ", " + selectedPos.y);
                },
                onMouseMove: function(event){
                    if(event.getButton() == cc.EventMouse.BUTTON_LEFT){
                        var node = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);
                        node.x += event.getDeltaX();
                        node.y += event.getDeltaY();
                    }
                }
            }, this);
        }

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
                            break;
                        case cc.KEY.num4:
                            cc.log('move player W');
                            break;
                        case cc.KEY.num6:
                            self.movePlayerE();
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
    },
    loadMap: function () {
        game.engine.area.map = new cc.TMXTiledMap(res.maps_ships_corvette);
        var map = game.engine.area.map;
        this.addChild(map, 0, TAG_TILE_MAP);
    },
    loadCharacters: function () {
        for (i in game.characters) {
            this.loadCharacter(game.characters[i].id)
        }
    },
    loadCharacter: function (id) {
        // create sprite sheet
        cc.spriteFrameCache.addSpriteFrames(res.units_sentinel_weapon_alien_plasma_rifle_run_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.units_sentinel_weapon_alien_plasma_rifle_run_png);
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
        this.walkAction = new cc.RepeatForever(new cc.Animate(game.engine.characters[id].animations.run.e));

        console.log(this.walkAction);

        game.engine.characters[id].sprite = new cc.Sprite(res["units_" + game.characters[id].skin + "_idle_png"]);
        var map = game.engine.area.map;
        map.addChild(game.engine.characters[id].sprite, map.children.length);
        game.engine.characters[id].sprite.attr({x:120, y:120});
        var tilePosition = map.tilePosToScreenPos(0, 0);
        // cc.log(tilePosition);
        game.engine.characters[id].sprite.x = tilePosition.x;
        game.engine.characters[id].sprite.y = tilePosition.y;
        game.engine.characters[id].sprite.anchorX = 0.5;
        game.engine.characters[id].sprite.anchorY = 0;

        game.engine.characters[id].sprite.runAction(this.walkAction);
        this.spriteSheet.addChild(game.engine.characters[id].sprite);
    },
    movePlayerE: function () {
        cc.log('move player E');
        var id = 0;
        var map = game.engine.area.map;
        //get tile x,y under the player
        var tilePosition = map.ScreenPosToTilePos(game.engine.characters[id].sprite.x, game.engine.characters[id].sprite.y);
        //get targeted screen position
        var newTilePos = cc.p(tilePosition.x + 1, tilePosition.y);//moving one tile east
        var tilePositionTarget = map.tilePosToScreenPos(newTilePos.x, newTilePos.y);
        game.engine.characters[id].sprite.x = tilePositionTarget.x;
        game.engine.characters[id].sprite.y = tilePositionTarget.y;
        // cc.log( tilePosition);

    }
});
