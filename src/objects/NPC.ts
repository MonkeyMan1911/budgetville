import * as ex from "excalibur"
import { Directions, MovementStates, Player } from "./player";
import { AnimationManager } from "../Animations/AnimationManager";
import { gameTextBox } from "../UI/Textbox";

export interface NPCTalkingEvent {
    type: string,
    text: string,
    direction: Directions | "mainChar"
}
export interface NPCTalking {
    requiredFlags : string[],
    events: NPCTalkingEvent[],
}

export interface NPCConfig {
    name: string,
    pos: ex.Vector,
    spriteSheet: ex.ImageSource,
    talking : NPCTalking[]
}

export class NPC extends ex.Actor {

    private spriteSheet: ex.SpriteSheet;

    private direction: Directions = Directions.Down;
    private movementState: MovementStates = MovementStates.Idle;
    private animationManager: AnimationManager;

    private talking: NPCTalking[] = [];
    private currentTalkingObj: NPCTalking | null = null
    public numTalkingIndexes: number = 0
    public currentTalkingIndex: number = 0

    private interactionZone: ex.Actor;

    constructor(config: NPCConfig) {
        super({
            name: config.name,
            pos: config.pos,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.Fixed,
            z: 40
        })

        this.interactionZone = new ex.Actor({
            name: `${this.name}-interaction-zone`,
            pos: ex.vec(0, 0),
            radius: 15,
            collisionType: ex.CollisionType.Passive
        })
        this.interactionZone.graphics.isVisible = false

        this.spriteSheet = ex.SpriteSheet.fromImageSource({
            image: config.spriteSheet,
            grid: {
                rows: 20,
                columns: 56,
                spriteHeight: 32,
                spriteWidth: 16
            }
        })
        this.animationManager = new AnimationManager({
            spritesheet: this.spriteSheet,
            actor: this
        })

        this.talking = config.talking
    }

    onInitialize(engine: ex.Engine): void {
        this.addChild(this.interactionZone)

        this.animationManager.play(`idle-${this.direction}`)
    }

    assignTalking() {
        let highestPriorityObj = this.talking[0]
        for (let talkingObj of this.talking) {
            let currentObjValid = true
            for (let flag of talkingObj.requiredFlags) {
                if (!window.localStorage.getItem(flag)) {
                    currentObjValid = false
                    break
                }
            }
            if (currentObjValid && talkingObj.requiredFlags.length > highestPriorityObj.requiredFlags.length) {
                highestPriorityObj = talkingObj;
            }
        }

        this.currentTalkingObj = highestPriorityObj 
        this.numTalkingIndexes = this.currentTalkingObj.events.length - 1
    }

    continueTalking(index: number, player: Player) {
        const eventObj = this.currentTalkingObj?.events[index]
        
        if (eventObj?.type === "textMessage") {
            this.textMessage(eventObj, player)
        }    
        
        this.currentTalkingIndex += 1 
    }

    private textMessage(eventObj: NPCTalkingEvent, player: Player) {
        gameTextBox.clear()
        gameTextBox.addText(eventObj.text)
        gameTextBox.show()
        this.direction = eventObj.direction === "mainChar" ? this.faceMainCharDirection(player) : eventObj.direction
        this.animationManager.play(`idle-${this.direction}`)
    }

    private faceMainCharDirection(player: Player): Directions {
        const dx = player.pos.x - this.pos.x;
        const dy = player.pos.y - this.pos.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? Directions.Right : Directions.Left;
        } 
        else {
            return dy > 0 ? Directions.Down : Directions.Up;
        }
    }
}