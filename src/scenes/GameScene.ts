import { DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext } from "excalibur";
import { Player } from "../player";
import { resourcesLoader } from "../utils/resourceLoader";

export class GameScene extends Scene {

    resources: any;

    constructor(resources: object) {
        super();
        this.resources = resources;
    }
    
    override onPreLoad(loader: DefaultLoader): void {
        resourcesLoader(this.resources, loader);
    }

    override onInitialize(engine: Engine): void {
        // const doorsLayer = this.resources.TestMap.getObjectLayers("Doors")[0];
        // console.log(doorsLayer)


        // for (let obj of doorsLayer.objects) {
        //     console.log(obj);
        // }

        this.resources.TiledMap.addToScene(this)

        const player = new Player();
        player.z = 42
        this.add(player); // Actors need to be added to a scene to be drawn
        this.camera.strategy.lockToActor(player);
        this.camera.zoom = 2.1
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