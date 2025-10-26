import { DisplayMode, Engine, vec } from "excalibur";
import { loader } from "./resources";
import World from "./scenes/World";

// Goal is to keep main.ts small and just enough to configure the engine

const game = new Engine({
	width: 800, // Logical width and height in game pixels
	height: 600,
	displayMode: DisplayMode.FitScreenAndFill, // Display mode tells excalibur how to fill the window
	pixelArt: true, // pixelArt will turn on the correct settings to render pixel art without jaggies or shimmering artifacts
	// scenes: {
	// 	start: MyLevel
	// }
});

// game.start('start', { // name of the start scene 'start'
// 	loader
// }).then(() => {
// 	game.add("scene1", new World())
// 	game.goToScene("scene1")
// 	//Resources.TestMap.addToScene(game.currentScene, {pos: vec(0, 0)});
// 	game.screen.canvas.style.imageRendering = "pixelated";
// });	

game.start(loader).then(() => {
	game.add("world", new World())
	game.goToScene("world")
})