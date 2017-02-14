# cocos2d-x-js-rpg-test
In this tiny project I am trying out cocos features so I can determine if I can develop an isometric rpg later.

How to run the game
-----------------------
1. Run `index.html` on local web server

How to run the game in developer mode
-----------------------
1. Download the code from [cocos2d download site][4]
2. Run `setup.py`
3. Make a new boilerplate Javascript project with the following command

`cocos new MyGame -p com.your_company.mygame -l js -d C:\Users\john.doe\`

<!-- `cocos new GameName -l js` -->

4. Copy the "frameworks" folder from your new JS project to the root directory of this project
5. Rename `index_dev.html` to `index.html`
6. Run `index.html` on local web server
7. Compile for Android
`cocos compile -p android --ndk-mode debug --app-abi armeabi-v7a --ap android-19`
close project in IDE and Browser to compile


[4]: http://www.cocos2d-x.org/download/