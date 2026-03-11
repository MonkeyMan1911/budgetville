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
            const data = createNPCData(this)
            this.npcs = data.World.NPCs
            this.triggerZones = data.World.TriggerZones
        }
        
        await super.onActivate(context);
    }
}