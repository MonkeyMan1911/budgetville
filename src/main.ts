import { DisplayMode, Engine, None, vec } from "excalibur";
import { loader, Resources } from "./resources";
import { OverWorld } from "./scenes/OverWorld";
import { initializePlayer } from "./objects/player";
import { UIKey } from "./objects/UIKey";
import { BankInterior } from "./scenes/BankInterior";
import { stockMarket } from "./systems/StockMarket";
import { gameStockMarketUi } from "./UI/StockMarketUI";

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

export const isMobile = (
    /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
) && window.matchMedia("(pointer: coarse)").matches;

const enterKey = new UIKey("enter", vec(0, 0), Resources.EnterKeyImg);
const eKey = new UIKey("e", vec(1, 0), Resources.EKeyImg);
const oKey = new UIKey("o", vec(2, 0), Resources.OKeyImg);
let player = null;

if (isMobile) {
	player = initializePlayer([oKey, oKey])
}
else {
	player = initializePlayer([eKey, enterKey])
}

(async () => {
	if (/iPhone|Android.+Mobile|Windows Phone/i.test(navigator.userAgent) && window.matchMedia("(pointer: coarse)").matches) {
		document.getElementById("main")!.remove()
		document.getElementById("screen-error")!.classList.remove("hide")
		return
	}

    await game.start(loader);
	stockMarket.start()
	gameStockMarketUi.initialize()
	game.goToScene("world", {sceneActivationData: {player}});
})();
