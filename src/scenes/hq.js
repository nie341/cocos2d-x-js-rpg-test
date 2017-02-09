/**
 * Created by stanislav.malchev on 2/7/2017.
 */
var GamePlayLayer = AreaMapLayer.extend({
    /*ctor:function () {
        
    }*/
});

var HQScene = cc.Scene.extend({
// var HQScene = AreaScene.extend({
    onEnter:function () {
        this._super();
        var layer = new GamePlayLayer();
        this.addChild(layer);

        var keyboard_layer = new KeyboardLayer();
        this.addChild(keyboard_layer);

    }
});
