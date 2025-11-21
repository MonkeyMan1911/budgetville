import { SpriteSheetRes } from "../resources";
import { NPC } from "./NPC";
import * as ex from "excalibur"
import { Directions } from "./player";

export const NPCData = {
    World: {
        NPCs: [
            new NPC({
                name: "TestNpc",
                pos: ex.vec(100, 100),
                spriteSheet: SpriteSheetRes.TestBanker,
                talking: [
                    {
                        requiredFlags: [],
                        events: [
                            {type: "textMessage", text: "Helloooo", direction: "mainChar"},
                            {type: "textMessage", text: "Second Message", direction: "mainChar"},
                            {type: "walk", tiles: 5, direction: Directions.Up},
                            {type: "textMessage", text: "Test 3rd Message", direction: "mainChar"}
                        ]
                    }
                ]
            })
        ]  
    }
}