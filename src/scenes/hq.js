/**
 * Created by stanislav.malchev on 2/7/2017.
 */
var GamePlayLayer = AreaMapLayer.extend({
    /*ctor:function () {
        
    }*/
});

var HQScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GamePlayLayer();
        this.addChild(layer);
    }
});
