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
        super(resources);
    }

    onActivate(context: SceneActivationContext<{player: Player}>): void {
        if (this.npcs.length === 0) {
            this.npcs = createNPCData(this).World.NPCs;
        }
        
        super.onActivate(context);
    }
}