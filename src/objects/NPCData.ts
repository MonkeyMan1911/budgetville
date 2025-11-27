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
                                {type: "textMessage", text: "Hello! Watch me walk!", direction: "mainChar"},
                                {type: "walk", tiles: 5, direction: Directions.Up, who: "TestNpc"}, // NPC walks (no 'who' field)
                                {type: "textMessage", text: "Now you walk!", direction: Directions.Down},
                                {type: "walk", tiles: 3, direction: Directions.Right, who: "player"}, // Player walks
                                {type: "textMessage", text: "Great! Let's both move!", direction: "mainChar"},
                                {type: "walk", tiles: 2, direction: Directions.Left, who: "TestNpc"}, // Specific NPC
                                {type: "textMessage", text: "All done!", direction: "mainChar"},
                            ]
                        },
                        {
                            requiredFlags: ["testFlag"],
                            events: [
                                {type: "textMessage", text: "We've already talked!", direction: "mainChar"},
                                {type: "removeFlag", flag: "testFlag"},
                            ]
                        }
                    ]
                }),
                new NPC({
                    name: "OtherNPC",
                    pos: ex.vec(150, 100),
                    spriteSheet: SpriteSheetRes.TestBanker,
                    gameScene: gameScene,
                    talking: [
                        {
                            requiredFlags: [],
                            events: [
                                {type: "textMessage", text: "I can be controlled in cutscenes too!", direction: "mainChar"},
                                {type: "walk", tiles: 2, direction: Directions.Down, who: "OtherNPC"},
                                {type: "textMessage", text: "Intresting...", direction: "currentDir"},
                                {type: "transaction", amount: 50}
                            ]
                        }
                    ]
                })
            ]  
        }
    }
}