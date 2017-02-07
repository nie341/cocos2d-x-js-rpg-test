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


