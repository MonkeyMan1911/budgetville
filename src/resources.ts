//resources.ts
import { ImageSource, Loader, Resource } from "excalibur";

export const Resources = {
	MainCharacterSpriteSheetImg: new ImageSource("./Sprites/MainCharacter.png"),
	EnterKeyImg: new ImageSource("./Tilesets/Keys/EnterKey.png"),
	EKeyImg: new ImageSource("./Tilesets/Keys/KeyE.png")
} as const; 

export const SpriteSheetRes = {
	TestBanker: new ImageSource("./Sprites/TestNpc.png"),
	BankManager: new ImageSource("./Sprites/BankManager.png")
} as const;

export const loader = new Loader();

loader.backgroundColor = "black"

// loader.startButtonFactory = () => {
// 	let startButton = document.createElement("button")
// 	startButton.textContent = "Start Game"	
// 	startButton.style.fontFamily = "PixelFo	nt"
// 	startButton.style.fontSize = "300%"
// 	startButton.style.height = "15vh"
// 	startButton.style.width = "25vw"
// 	startButton.style.borderRadius = "20px"
// 	startButton.style.backgroundColor = "#37de61"
// 	startButton.style.cursor = "pointer"
// 	return startButton
// }

loader.suppressPlayButton = true

for (const res of Object.values(Resources)) {
	loader.addResource(res);
}
for (const res of Object.values(SpriteSheetRes)) {
	loader.addResource(res);
}