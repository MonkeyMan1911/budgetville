import { DefaultLoader, Scene, SceneActivationContext } from "excalibur";
import * as ex from "excalibur"
import { Player } from "../objects/player";
import { resourcesLoader } from "../utils/resourceLoader";
import DoorObject from "../objects/DoorObject";
import { TiledResource } from "@excaliburjs/plugin-tiled";
import { NPC } from "../objects/NPC";
import { balanceDiv } from "../UI/BalanceUI";
import { ChunkedTiledMap } from "./ChunkedTiledMap";
import { joystick } from "../objects/Joystick";
import { isMobile } from "../main";
import { actionButton } from "../objects/ActionButton";

export interface GameSceneResources {
    TiledMap: TiledResource
    NPCSpriteSheets?: ex.ImageSource[]
}

export class GameScene extends Scene {
    resources: GameSceneResources;
    player: Player | undefined;
    npcs: NPC[] = [];
    private chunkedMap: ChunkedTiledMap | null = null;
    private useChunking: boolean = false; // Set to true to enable chunking

    constructor(resources: GameSceneResources, useChunking: boolean = false) {
        super();
        this.resources = resources;
        this.useChunking = useChunking;
    }
    
    override onPreLoad(loader: DefaultLoader): void {
        resourcesLoader(this.resources, loader);
    }

    async onActivate(context: SceneActivationContext<{player: Player}>): Promise<void> {
        if (isMobile) {
            this.add(joystick)
            this.add(actionButton)
        }
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

        this.add(this.player.keysArray[0])
        this.add(this.player.keysArray[1])

        if (this.useChunking) {
            // Use chunked loading for large maps
            this.chunkedMap = new ChunkedTiledMap({
                tiledResource: this.resources.TiledMap,
                chunkSize: 16, // 16x16 tiles per chunk (adjust based on your needs)
                renderDistance: 2 // Load 2 chunks in each direction around player
            });
            
            await this.chunkedMap.initialize(this);
            
            // Do initial load around player position
            this.chunkedMap.update(this.player.pos);
        } else {
            // Load entire map at once (original behavior)
            this.resources.TiledMap.addToScene(context.engine.currentScene, {pos: ex.vec(0, 0)})
            
            // Set z-index of decor layers
            const decorLayers = this.resources.TiledMap.getTileLayers();
            decorLayers.forEach(layer => {
                if (layer.name.includes("Decor")) {
                    layer.tilemap.z = 50;
                }
            });
        }

        balanceDiv.show()
        balanceDiv.updateBalance(this.player.getBalance())
    }

    override onPreUpdate(engine: ex.Engine, delta: number): void {
        // Update chunked map based on player position
        if (this.chunkedMap && this.player) {
            this.chunkedMap.update(this.player.pos);
        }
    }

    override onDeactivate(context: ex.SceneActivationContext): void {
        // Clean up chunks when leaving scene
        if (this.chunkedMap) {
            this.chunkedMap.destroy();
            this.chunkedMap = null;
        }
    }
}