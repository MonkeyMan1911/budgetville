import { TiledResource } from "@excaliburjs/plugin-tiled";
import { ImageSource, Loader } from "excalibur";

export const Resources = {
	// Sprite Sheet Images
	MainCharacterSpriteSheetImg: new ImageSource("./Sprites/MainCharacter.png"),
	//TestMap: new TiledResource("./Maps/ExteriorsSet.tmx")
} as const; // the 'as const' is a neat typescript trick to get strong typing on your resources. 

export const loader = new Loader();
for (const res of Object.values(Resources)) {
	loader.addResource(res);
}
