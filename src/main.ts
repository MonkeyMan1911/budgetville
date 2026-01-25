import { DisplayMode, Engine, vec } from "excalibur";
import { loader, Resources } from "./resources";
import { OverWorld } from "./scenes/OverWorld";
import { initializePlayer, Player } from "./objects/player";
import { UIKey } from "./objects/UIKey";
import { BankInterior } from "./scenes/BankInterior";
import { stockMarket } from "./systems/StockMarket";

const game = new Engine({
	canvasElementId: "game",
	width: 800, 
	height: 600,
	displayMode: DisplayMode.FitScreenAndFill, 
	pixelArt: true,
	scenes: {
		world: new OverWorld(),
		bankInterior: new BankInterior()
	}
});

const enterKey = new UIKey("enter", vec(0, 0), Resources.EnterKeyImg);
const eKey = new UIKey("e", vec(1, 0), Resources.EKeyImg);
const player = initializePlayer(enterKey, eKey);

(async () => {
    await game.start(loader);

	    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
	//@ts-expect-error
    } else if (elem.webkitRequestFullscreen) {
		//@ts-expect-error
        elem.webkitRequestFullscreen(); 
	//@ts-expect-error
    } else if (elem.mozRequestFullScreen) {
		//@ts-expect-error
        elem.mozRequestFullScreen();
	//@ts-expect-error
    } else if (elem.msRequestFullscreen) {
		//@ts-expect-error
        elem.msRequestFullscreen();
    }

	stockMarket.start()
	game.goToScene("world", {sceneActivationData: {player}});
})();
