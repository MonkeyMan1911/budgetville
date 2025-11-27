import { createNPCData } from '../objects/NPCData';
import { player, Player } from '../objects/player';
import { GameScene } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

class World extends GameScene {
    constructor() {
        const resources = {
            TiledMap: new TiledResource("./Maps/ExteriorsSet.tmx"),
        };
        super(resources, null as any);
        this.npcs = createNPCData(this).World.NPCs;
    }
}

export const world = new World();