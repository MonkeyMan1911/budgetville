import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import * as ex from "excalibur"
import { Player } from "../objects/player";
import { resourcesLoader } from "../utils/resourceLoader";
import DoorObject from "../objects/DoorObject";
import { TiledResource } from "@excaliburjs/plugin-tiled";
import { UIKey } from "../objects/UIKey";
import { Resources } from "../resources";


export interface GameSceneResources {
    TiledMap: TiledResource
}

export class GameScene extends Scene {

    resources: GameSceneResources;
    player: Player;

    constructor(resources: GameSceneResources, player: Player) {
        super();
        this.resources = resources;
        this.player = player
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

        this.add(this.player);
        this.camera.strategy.lockToActor(this.player)
        this.camera.zoom = 2.1

        this.add(this.player.enterKey)

       this.resources.TiledMap.addToScene(engine.currentScene, {pos: ex.vec(0, 0)})
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