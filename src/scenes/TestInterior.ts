import { BoundingBox, Engine } from 'excalibur';
import { Player } from '../objects/player';
import { GameScene, GameSceneResources } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class TestInterior extends GameScene {
    constructor() {
        const resources: GameSceneResources = {
            TiledMap: new TiledResource("./Maps/TestInterior.tmx")
        };
        super(resources, null as any);
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine)

        this.camera.strategy.limitCameraBounds(new BoundingBox(0, 0, 144, 144))
    }
}

export const testInterior = new TestInterior()