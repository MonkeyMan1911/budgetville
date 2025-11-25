import { SpriteSheetRes } from "../resources";
import { NPC } from "./NPC";
import * as ex from "excalibur"
import { Directions } from "./player";
import { GameScene } from "../scenes/GameScene";

export function createNPCData(gameScene: GameScene) {
    return {
        World: {
            NPCs: [
                new NPC({
                    name: "TestNpc",
                    pos: ex.vec(100, 100),
                    spriteSheet: SpriteSheetRes.TestBanker,
                    gameScene: gameScene,
                    talking: [
                        {
                            requiredFlags: [],
                            events: [
                                {type: "addFlag", flag: "testFlag", value: true},
                                {type: "textMessage", text: "Helloooo", direction: "mainChar"},
                                {type: "textMessage", text: "Second Message", direction: "mainChar"},
                                {type: "walk", tiles: 5, direction: Directions.Up},
                                {type: "textMessage", text: "Test 3rd Message", direction: "mainChar"},
                            ]
                        }
                    ]
                })
            ]  
        }
    }
}