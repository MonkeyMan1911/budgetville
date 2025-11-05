import { Player } from '../objects/player';
import { GameScene } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class World extends GameScene {
    constructor(player: Player) {
        const resources = {
            TiledMap: new TiledResource("./Maps/ExteriorsSet.tmx"),
        };
        super(resources, player);
    }
}

export default World;