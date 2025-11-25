import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import * as ex from "excalibur"
import { Player } from "../objects/player";
import { resourcesLoader } from "../utils/resourceLoader";
import DoorObject from "../objects/DoorObject";
import { TiledResource } from "@excaliburjs/plugin-tiled";
import { NPC, NPCConfig } from "../objects/NPC";
import { SpriteSheetRes } from "../resources";
import { balanceDiv } from "../UI/BalanceUI";
import { createNPCData } from "../objects/NPCData";


export interface GameSceneResources {
    TiledMap: TiledResource
    NPCSpriteSheets?: ex.ImageSource[]
}

export class GameScene extends Scene {

    resources: GameSceneResources;
    player: Player;
    npcs: NPC[] = [];

    constructor(resources: GameSceneResources, player: Player) {
        super();
        this.resources = resources;
        this.player = player;

        this.npcs = createNPCData(this).World.NPCs
    }
    
    override onPreLoad(loader: DefaultLoader): void {
        resourcesLoader(this.resources, loader);
    }

    override onInitialize(engine: Engine): void {

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

       this.resources.TiledMap.addToScene(engine.currentScene, {pos: ex.vec(0, 0)})

        balanceDiv.show()
        balanceDiv.updateBalance(this.player.balance)
    }

    override onActivate(context: SceneActivationContext<unknown>): void {
        // Called when Excalibur transitions to this scene
        // Only 1 scene is active at a time
    }

    override onDeactivate(context: SceneActivationContext): void {
        // Called when Excalibur transitions away from this scene
        // Only 1 scene is active at a time
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        // Called before anything updates in the scene
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        // Called after everything updates in the scene
    }

    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called before Excalibur draws to the screen
    }

    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {
        // Called after Excalibur draws to the screen
    }
}