import { TiledResource } from "@excaliburjs/plugin-tiled";
import { ImageSource, Loader } from "excalibur";

export const Resources = {
	MainCharacterSpriteSheetImg: new ImageSource("./Sprites/MainCharacter.png"),
	EnterKeyImg: new ImageSource("./Tilesets/Keys/EnterKey.png")
} as const; 

export const loader = new Loader();
for (const res of Object.values(Resources)) {
	loader.addResource(res);
}
