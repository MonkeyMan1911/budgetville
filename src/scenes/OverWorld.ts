import { SceneActivationContext } from 'excalibur';
import { createNPCData } from '../objects/NPCData';
import { Player } from '../objects/player';
import { GameScene } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';

export class OverWorld extends GameScene {
    constructor() {
        const resources = {
            TiledMap: new TiledResource("./Maps/ExteriorsSet.tmx"),
        };
        // Enable chunking for the large overworld map (100x100 tiles)
        super(resources, true); // Pass true to enable chunking
    }

    async onActivate(context: SceneActivationContext<{player: Player}>): Promise<void> {
        if (this.npcs.length === 0) {
            this.npcs = createNPCData(this).World.NPCs;
        }
        
        await super.onActivate(context);
    }
}