import { SpriteSheetRes } from "../resources";
import { NPC } from "./NPC";
import * as ex from "excalibur"
import { Directions } from "./player";
import { GameScene } from "../scenes/GameScene";
import { calculateDistance } from "../utils/calculateDistance";

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
                                {type: "textMessage", text: "Choose a choice", direction: "mainChar", choices: [
                                    {content: "Choice 1", flag: "choice1"},
                                    {content: "Choice 2", flag: "choice2"}
                                ]},
                                {type: "textMessage", text: "shld skip", direction: "currentDir"},
                                {type: "textMessage", text: "You chose choice 1", direction: "currentDir", requireFlags: ["choice1"]},
                                {type: "textMessage", text: "You chose choice 2", direction: "currentDir", requireFlags: ["choice2"]}
                            ]
                        }
                    ]
                })
            ]  
        },
        Bank: {
            NPCs: [ 
                new NPC({
                    name: "Bank Manager",
                    pos: ex.vec(calculateDistance(24.5), calculateDistance(2.8)),
                    spriteSheet: SpriteSheetRes.BankManager,
                    gameScene: gameScene,
                    talking: [],
                    z: 7 
                })
            ]
        }
    }
}