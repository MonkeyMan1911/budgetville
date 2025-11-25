import * as ex from "excalibur"
import { Directions, MovementStates, Player } from "./player";
import { AnimationManager } from "../Animations/AnimationManager";
import { gameTextBox } from "../UI/Textbox";
import { calculateDistance } from "../utils/calculateDistance";

export interface TalkingEvent {
    type: "textMessage",
    text: string,
    direction: Directions | "mainChar"
}
export interface WalkingEvent {
    type: "walk",
    tiles: number,
    direction: Directions
}
export interface AddFlagEvent {
    type: "addFlag",
    flag: string,
    value: any
}
export interface RemoveFlagEvent {
    type: "removeFlag",
    flag: string,
}
export type EventObj = TalkingEvent | WalkingEvent | AddFlagEvent | RemoveFlagEvent
export interface NPCTalking {
    requiredFlags : string[],
    events: EventObj[],
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

    private targetPos: ex.Vector = ex.Vector.Zero;
    private distanceTraveled: number = 0;
    private walkingEvent: WalkingEvent | null = null
    private speed: number = 1.2
    private moveDir: ex.Vector = ex.Vector.Zero

    private playerRef: Player | null = null;

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
        this.playerRef = player
        const eventObj = this.currentTalkingObj?.events[index]
        
        if (eventObj?.type === "textMessage") {
            this.textMessage(eventObj as TalkingEvent, player)
            this.currentTalkingIndex += 1
        }    
        else if (eventObj?.type === "walk") {
            gameTextBox.clear()
            gameTextBox.hide()
            this.walk(eventObj as WalkingEvent)
            this.currentTalkingIndex += 1
        }
        else if (eventObj?.type === "addFlag") {
            window.localStorage.setItem(eventObj.flag, eventObj.value)
            this.currentTalkingIndex += 1

            if (this.currentTalkingIndex <= this.numTalkingIndexes) {
                this.continueTalking(this.currentTalkingIndex, player)
            }
        }
        else if (eventObj?.type === "removeFlag") {
            window.localStorage.removeItem(eventObj.flag)
            this.currentTalkingIndex += 1
            
            if (this.currentTalkingIndex <= this.numTalkingIndexes) {
                this.continueTalking(this.currentTalkingIndex, player)
            }
        }
        
    }

    private textMessage(eventObj: TalkingEvent, player: Player) {
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

    private walk(eventObj: WalkingEvent) {
        let amountToWalk = calculateDistance(eventObj.tiles) 
        this.distanceTraveled = 0
        this.walkingEvent = eventObj 

        this.direction = eventObj.direction
         
        let moveDir = ex.Vector.Zero
        switch (eventObj.direction) {
            case Directions.Down: moveDir = ex.Vector.Down; break;
            case Directions.Up: moveDir = ex.Vector.Up; break;
            case Directions.Left: moveDir = ex.Vector.Left; break;
            case Directions.Right: moveDir = ex.Vector.Right; break;
        } 
        this.targetPos = moveDir.x !== 0 ? ex.vec(this.pos.x + amountToWalk * moveDir.x, this.pos.y) : ex.vec(this.pos.x, this.pos.y + amountToWalk * moveDir.y)

        this.moveDir = moveDir.normalize().scale(this.speed)
    }

    override onPreUpdate(engine: ex.Engine, elapsed: number): void {
        if (!this.targetPos.equals(ex.Vector.Zero)) {
            let reachedTarget = false
 
            if (this.moveDir.y !== 0) {
                if (this.moveDir.y > 0) {
                    if (Math.floor(this.pos.y) >= Math.floor(this.targetPos.y)) {
                        reachedTarget = true
                    }
                } else {
                    if (Math.floor(this.pos.y) <= Math.floor(this.targetPos.y)) {
                        reachedTarget = true
                    }
                }
            } 

            if (this.moveDir.x !== 0) {
                if (this.moveDir.x > 0) {
                    if (Math.floor(this.pos.x) >= Math.floor(this.targetPos.x)) {
                        reachedTarget = true
                    } 
                } else {
                    if (Math.floor(this.pos.x) <= Math.floor(this.targetPos.x)) {
                        reachedTarget = true
                    }
                }
            }
 
            if (!reachedTarget) {
                this.pos.x += this.moveDir.x 
                this.pos.y += this.moveDir.y 
                this.movementState = MovementStates.Walk 
                this.animationManager.play(`walk-${this.direction}`)
            } else {
                this.movementState = MovementStates.Idle
                this.animationManager.goToIdle(this.direction)
                this.targetPos = ex.vec(0, 0)
                if (this.currentTalkingIndex <= this.numTalkingIndexes) {
                    this.continueTalking(this.currentTalkingIndex, this.playerRef!)
                }
            }
        }
    }
}