import { DisplayMode, Engine, vec } from "excalibur";
import { loader, Resources } from "./resources";
import { world } from "./scenes/World";
import TestInterior from "./scenes/TestInterior";
import { initializePlayer, Player } from "./objects/player";
import { UIKey } from "./objects/UIKey";

// Goal is to keep main.ts small and just enough to configure the engine

const game = new Engine({
	canvasElementId: "game",
	width: 800, // Logical width and height in game pixels
	height: 600,
	displayMode: DisplayMode.FitScreenAndFill, // Display mode tells excalibur how to fill the window
	pixelArt: true, // pixelArt will turn on the correct settings to render pixel art without jaggies or shimmering artifacts
});

game.start(loader).then(() => {
	const enterKey = new UIKey("enter", vec(0, 0), Resources.EnterKeyImg);
	const eKey = new UIKey("e", vec(1, 0), Resources.EKeyImg);
	const player = initializePlayer(enterKey, eKey);

	world.player = player

	game.add("world", world)
	//game.add("testInterior", new TestInterior(player))
	game.goToScene("world")
})