import { GameScene, GameSceneResources } from './GameScene';
import { TiledResource } from '@excaliburjs/plugin-tiled';
import { createNPCData } from '../objects/NPCData';
import { SceneActivationContext } from 'excalibur';
import { Player } from '../objects/player';

export class BankInterior extends GameScene {
    constructor() {
        const resources: GameSceneResources = {
            TiledMap: new TiledResource("./Maps/BankInterior.tmx")
        };
        // Don't use chunking for small interior maps
        super(resources, false); // Pass false to disable chunking
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