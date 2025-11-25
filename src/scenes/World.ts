import { player, Player } from '../objects/player';
import { GameScene } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class World extends GameScene {
    constructor() {
        const resources = {
            TiledMap: new TiledResource("./Maps/ExteriorsSet.tmx"),
        };
        super(resources, null as any);
    }
}

export const world = new World();