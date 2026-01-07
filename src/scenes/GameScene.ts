import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import * as ex from "excalibur"
import { Player } from "../objects/player";
import { resourcesLoader } from "../utils/resourceLoader";
import DoorObject from "../objects/DoorObject";
import { TiledResource } from "@excaliburjs/plugin-tiled";
import { NPC } from "../objects/NPC";
import { balanceDiv } from "../UI/BalanceUI";

export interface GameSceneResources {
    TiledMap: TiledResource
    NPCSpriteSheets?: ex.ImageSource[]
}

export class GameScene extends Scene {

    resources: GameSceneResources;
    player: Player | undefined;
    npcs: NPC[] = [];

    constructor(resources: GameSceneResources) {
        super();
        this.resources = resources;
    }
    
    override onPreLoad(loader: DefaultLoader): void {
        resourcesLoader(this.resources, loader);
    }

    onActivate(context: SceneActivationContext<{player: Player}>): void {
        this.player = context.data!.player

        // Add door objects to the scene
        const doorsLayer = this.resources.TiledMap.getObjectLayers("DoorObjects")[0].objects;    
        for (let doorObj of doorsLayer) {
            const door = new DoorObject(doorObj.tiledObject)
            this.add(door)
        }

        for (let npc of this.npcs) {
            this.add(npc)
        }

        this.add(this.player);
        this.camera.strategy.lockToActor(this.player)
        this.camera.zoom = 2.1

        this.add(this.player.enterKey)
        this.add(this.player.eKey)

       this.resources.TiledMap.addToScene(context.engine.currentScene, {pos: ex.vec(0, 0)})

        const decorLayers = this.resources.TiledMap.getTileLayers();
        
        decorLayers.forEach(layer => {
            if (layer.name.includes("Decor")) {
                layer.tilemap.z = 50
            }
        });

        balanceDiv.show()
        balanceDiv.updateBalance(this.player.balance)
    }
}