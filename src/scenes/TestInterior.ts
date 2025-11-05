import { BoundingBox, Engine } from 'excalibur';
import { Player } from '../objects/player';
import { GameScene } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class TestInterior extends GameScene {
    constructor(player: Player) {
        const resources = {
            // TODO Consider changing the tile map to a string and move the new TiledMapResource into the GameScene?
            TiledMap: new TiledResource("./Maps/TestInterior.tmx"),
        };
        super(resources, player);
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine)

        this.camera.strategy.limitCameraBounds(new BoundingBox(0, 0, 144, 144))
    }

    /**
     * Start-up logic, called once
     */
    // onInitialize(engine: Engine) {
    // // load scene-specific assets
    // // engine.start(sceneLoader).then(() => {
    // //   this._loaded = true
    // // })
    // }
  
    // onActivate(ctx: any) {
    // // const { spawnLocation } = ctx.data
    // // console.log(spawnLocation)
    // }

    // // When scene is exited perform these steps
    // onDeactivate(ctx: any) {
    // // this.saveState()
    // }
}

export default TestInterior;