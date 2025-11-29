import { BoundingBox, Engine } from 'excalibur';
import { Player } from '../objects/player';
import { GameScene, GameSceneResources } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class BankInterior extends GameScene {
    constructor() {
        const resources: GameSceneResources = {
            TiledMap: new TiledResource("./Maps/BankInterior.tmx")
        };
        super(resources, null as any);
    }
}

export const bankInterior = new BankInterior()