import { BoundingBox, Engine } from 'excalibur';
import { Player } from '../objects/player';
import { GameScene } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class TestInterior extends GameScene {
    constructor(player: Player) {
        const resources = {
            TiledMap: new TiledResource("./Maps/TestInterior.tmx"),
        };
        super(resources, player);
    }

    override onInitialize(engine: Engine): void {
        super.onInitialize(engine)

        this.camera.strategy.limitCameraBounds(new BoundingBox(0, 0, 144, 144))
    }
}

export default TestInterior;