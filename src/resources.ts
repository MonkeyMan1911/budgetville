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

loader.suppressPlayButton = true

for (const res of Object.values(Resources)) {
	loader.addResource(res);
}
for (const res of Object.values(SpriteSheetRes)) {
	loader.addResource(res);
}