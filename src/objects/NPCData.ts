import { SpriteSheetRes } from "../resources";
import { NPC } from "./NPC";
import * as ex from "excalibur"

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
                            {type: "textMessage", text: "Helloooo"}
                        ]
                    }
                ]
            })
        ]  
    }
}