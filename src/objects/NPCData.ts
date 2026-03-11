import { SpriteSheetRes } from "../resources";
import { NPC } from "./NPC";
import * as ex from "excalibur"
import { Directions } from "./player";
import { GameScene } from "../scenes/GameScene";
import { calculateDistance } from "../utils/calculateDistance";
import Mission from "../systems/Mission";
import { TriggerZone } from "./TriggerZone";

export function createNPCData(gameScene: GameScene) {
    return {
        World: {
            NPCs: [
                new NPC({
                    name: "George",
                    pos: ex.vec(calculateDistance(28), calculateDistance(15)),
                    spriteSheet: SpriteSheetRes.TestBanker,
                    gameScene: gameScene,
                    talking: [
                        {
                            requiredFlags: [],
                            events: [
                                {type: "textMessage", text: "Hello! Watch me walk!", direction: "mainChar"},
                                {
                                    type: "assignMission", 
                                    mission: new Mission({
                                        type: "collectFlag",
                                        value: "testMissionFlag",
                                        name: "Test Mission",
                                        description: "Test Mission desc"
                                    }) 
                                }
                            ]
                        }
                    ]
                }),

                new NPC({
                    name: "George2",
                    pos: ex.vec(calculateDistance(25), calculateDistance(15)),
                    spriteSheet: SpriteSheetRes.TestBanker,
                    gameScene: gameScene,
                    talking: [
                        {
                            requiredFlags: [],
                            events: [
                                {type: "addFlag", flag: "testMissionFlag", value: true},
                                {type: "textMessage", text: "All done!", direction: "mainChar"},
                            ]
                        }
                    ]
                }),

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
                                    {content: "Choice 2", flag: "choice2"},
                                    {content: "Choice 1", flag: "choice3"},
                                    {content: "Choice 2", flag: "choice4"}
                                ]},
                                {type: "textMessage", text: "You chose choice 1", direction: "currentDir", requireFlags: ["choice1"]},
                                {type: "textMessage", text: "You chose choice 2", direction: "currentDir", requireFlags: ["choice2"]},
                                {type: "textMessage", text: "final", direction: "currentDir"}
                            ]
                        }
                    ]
                })
            ],
            TriggerZones: [
                new TriggerZone({
                    pos: ex.vec(calculateDistance(25), calculateDistance(18)),
                    width: 32,
                    height: 32,
                    missionName: "Test Mission",   // matches Mission name exactly
                    cutscene: {
                        requiredFlags: [],
                        events: [
                            { type: "textMessage", text: "You arrived! Mission complete.", direction: Directions.Down }
                        ]
                    }
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
                    z: 51
                })
            ],
            TriggerZones: []
        }
    }
}