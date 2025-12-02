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
        super(resources);
    }

    onActivate(context: SceneActivationContext<{player: Player}>): void {
        if (this.npcs.length === 0) {
            this.npcs = createNPCData(this).Bank.NPCs;
        }

        super.onActivate(context);
    }
}