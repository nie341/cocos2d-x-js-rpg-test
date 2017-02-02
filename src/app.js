var TAG_TILE_MAP = 1;
var TAG_PLAYER = 2;
cc.TMXTiledMap.prototype.tilePosToScreenPos = function(posX, posY) {
    var x = this._tileSize.width / 2 * (this._mapSize.width + posX - posY);
    var y = this._tileSize.height * ( this._mapSize.height - (posX + posY) / 2);
    var point = cc.p(x, y - this._tileSize.height / 2 );
    return point;
};

cc.TMXTiledMap.prototype.ScreenPosToTilePos = function(posX, posY) {
    var x = this._mapSize.width / 2 + this._mapSize.height - posX / this._tileSize.width - posY / this._tileSize.height;
    var y =  this._mapSize.height - this._mapSize.width / 2 - posY / this._tileSize.height + posX / this._tileSize.width;
    var point = cc.p(y, x);
    point.x = Math.floor(point.x);
    point.y = Math.floor(point.y);
    return point;
};

var GamePlayLayer = cc.Layer.extend({
    spriteSheet: null,
    walkAction: null,
    sprite: null,
    
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;


        // create sprite sheet
        cc.spriteFrameCache.addSpriteFrames(res.man_sprite_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.man_sprite_png);
        this.addChild(this.spriteSheet);

        // init walkAction
        var animFrames = [];
        var str = "walk/w_2.png";
        var frame = cc.spriteFrameCache.getSpriteFrame(str);
        animFrames.push(frame);
        str = "walk/w_3.png";
        frame = cc.spriteFrameCache.getSpriteFrame(str);
        animFrames.push(frame);
        console.log(animFrames);
        /*for (var i = 0; i < 8; i++) {
            var str = "runner" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }*/

        var animation = new cc.Animation(animFrames, 0.1);
        this.walkAction = new cc.RepeatForever(new cc.Animate(animation));

        
        var map = new cc.TMXTiledMap(res.map_tmx);
        this.addChild(map, 0, TAG_TILE_MAP);

        cc.log(map);

        this.sprite = new cc.Sprite(res.man_sprite_png);

        map.addChild(this.sprite, map.children.length, TAG_PLAYER);
        this.sprite.attr({x:16, y:16});
        this.sprite.runAction(this.walkAction);
        // this.spriteSheet.addChild(this.sprite);

        // move map to the center of the screen
        var ms = map.getMapSize();
        var ts = map.getTileSize();
        // map.runAction(cc.moveTo(1.0, cc.p((size.width / 2) + (-ms.width * ts.width / 2), (size.height / 2) - (-ms.height , ts.height) )));
        map.x = (size.width / 2) + (-ms.width * ts.width / 2);
        map.y = (size.height / 2) + ( -ms.height * ts.height / 2) ;

        //1.load spritesheet
        /*this.sprite = new cc.Sprite("#walk/w_2.png");
        map.addChild(this.sprite, map.children.length);
        var mapWidth = map.getMapSize().width * map.getTileSize().width;
        this.sprite.x = mapWidth / 2;
        this.sprite.y = 0;
        this.sprite.anchorX = 0.5;
        this.sprite.anchorY = 0;*/


        var tilePosition = map.tilePosToScreenPos(0, 0);
        // cc.log(tilePosition);
        this.sprite.x = tilePosition.x;
        this.sprite.y = tilePosition.y;
        this.sprite.anchorX = 0.5;
        this.sprite.anchorY = 0;


        if ('mouse' in cc.sys.capabilities) {
            cc.eventManager.addListener({
                event: cc.EventListener.MOUSE,
                onMouseDown: function(event){

                    cc.log("Mouse Raw Position: " + event.getLocation().x + ", " + event.getLocation().y);
                    var map = event.getCurrentTarget().getChildByTag(TAG_TILE_MAP);
                    var player = map.getChildByTag(TAG_PLAYER);
                    var position = map.convertTouchToNodeSpace(event);
                    // cc.log( position);
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
                        player.x = tilePositionTarget.x;
                        player.y = tilePositionTarget.y;
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
                    var strTemp = "Key down:" + key;
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
                    cc.log(strTemp);
                },
                onKeyReleased: function (key, event) {
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
                    cc.log(strTemp);
                }
            }, this);
        } else {
            cc.log("KEYBOARD Not supported");
        }

        return true;
    },
    getKeyStr: function (keycode) {
        if (keycode == cc.KEY.none)
        {
            return "";
        }

        for (var keyTemp in cc.KEY)
        {
            if (cc.KEY[keyTemp] == keycode)
            {
                return keyTemp;
            }
        }
        return "";
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GamePlayLayer();
        this.addChild(layer);
    }
});

