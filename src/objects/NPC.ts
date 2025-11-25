import * as ex from "excalibur"
import { Directions, MovementStates, Player } from "./player";
import { AnimationManager } from "../Animations/AnimationManager";
import { calculateDistance } from "../utils/calculateDistance";
import { GameScene } from "../scenes/GameScene";
import { Cutscene } from "../Cutscene";

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
    talking : NPCTalking[],
    gameScene: GameScene
}

export class NPC extends ex.Actor {
    private spriteSheet: ex.SpriteSheet;

    private direction: Directions = Directions.Down;
    private movementState: MovementStates = MovementStates.Idle;
    private animationManager: AnimationManager;

    private talking: NPCTalking[] = [];
    private currentCutscene: Cutscene | null = null;

    private interactionZone: ex.Actor;

    private targetPos: ex.Vector = ex.Vector.Zero;
    private speed: number = 1.2;
    private moveDir: ex.Vector = ex.Vector.Zero;

    private gameScene: GameScene;

    constructor(config: NPCConfig) {
        super({
            name: config.name,
            pos: config.pos,
            width: 16,
            height: 16,
            collisionType: ex.CollisionType.Fixed,
            z: 40
        })

        this.gameScene = config.gameScene;

        this.interactionZone = new ex.Actor({
            name: `${this.name}-interaction-zone`,
            pos: ex.vec(0, 0),
            radius: 15,
            collisionType: ex.CollisionType.Passive
        })
        this.interactionZone.graphics.isVisible = false;

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

        this.talking = config.talking;
    }

    onInitialize(engine: ex.Engine): void {
        this.addChild(this.interactionZone);
        this.animationManager.play(`idle-${this.direction}`);
    }

    assignTalking() {
        let highestPriorityObj = this.talking[0];
        for (let talkingObj of this.talking) {
            let currentObjValid = true;
            for (let flag of talkingObj.requiredFlags) {
                if (!window.localStorage.getItem(flag)) {
                    currentObjValid = false;
                    break;
                }
            }
            if (currentObjValid && talkingObj.requiredFlags.length > highestPriorityObj.requiredFlags.length) {
                highestPriorityObj = talkingObj;
            }
        }

        // Create a new cutscene with the selected talking data
        this.currentCutscene = new Cutscene(highestPriorityObj);
        
        // Set up callbacks for the cutscene
        this.currentCutscene.setWalkCallback((walkEvent) => {
            this.walk(walkEvent);
        });
        
        this.currentCutscene.setFaceDirectionCallback((direction) => {
            this.direction = direction;
            this.animationManager.play(`idle-${this.direction}`);
        });
    }

    startCutscene(player: Player) {
        if (this.currentCutscene) {
            // Override the face direction callback to include player position
            this.currentCutscene.setFaceDirectionCallback((direction) => {
                if (direction === Directions.Down) { // This means it was "mainChar"
                    this.direction = this.faceMainCharDirection(player);
                } else {
                    this.direction = direction;
                }
                this.animationManager.play(`idle-${this.direction}`);
            });
            
            this.currentCutscene.start(player);
        }
    }

    continueCutscene() {
        if (this.currentCutscene && !this.currentCutscene.isComplete()) {
            this.currentCutscene.continueToNextEvent();
        }
    }

    isCutsceneComplete(): boolean {
        return this.currentCutscene ? this.currentCutscene.isComplete() : true;
    }

    resetCutscene() {
        if (this.currentCutscene) {
            this.currentCutscene.reset();
            this.currentCutscene = null;
        }
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
        let amountToWalk = calculateDistance(eventObj.tiles);
        this.direction = eventObj.direction;
         
        let moveDir = ex.Vector.Zero;
        switch (eventObj.direction) {
            case Directions.Down: moveDir = ex.Vector.Down; break;
            case Directions.Up: moveDir = ex.Vector.Up; break;
            case Directions.Left: moveDir = ex.Vector.Left; break;
            case Directions.Right: moveDir = ex.Vector.Right; break;
        } 
        this.targetPos = moveDir.x !== 0 
            ? ex.vec(this.pos.x + amountToWalk * moveDir.x, this.pos.y) 
            : ex.vec(this.pos.x, this.pos.y + amountToWalk * moveDir.y);

        this.moveDir = moveDir.normalize().scale(this.speed);
    }

    override onPreUpdate(engine: ex.Engine, elapsed: number): void {
        if (!this.targetPos.equals(ex.Vector.Zero)) {
            let reachedTarget = false;
 
            if (this.moveDir.y !== 0) {
                if (this.moveDir.y > 0) {
                    if (Math.floor(this.pos.y) >= Math.floor(this.targetPos.y)) {
                        reachedTarget = true;
                    }
                } else {
                    if (Math.floor(this.pos.y) <= Math.floor(this.targetPos.y)) {
                        reachedTarget = true;
                    }
                }
            } 

            if (this.moveDir.x !== 0) {
                if (this.moveDir.x > 0) {
                    if (Math.floor(this.pos.x) >= Math.floor(this.targetPos.x)) {
                        reachedTarget = true;
                    } 
                } else {
                    if (Math.floor(this.pos.x) <= Math.floor(this.targetPos.x)) {
                        reachedTarget = true;
                    }
                }
            }
 
            if (!reachedTarget) {
                this.pos.x += this.moveDir.x;
                this.pos.y += this.moveDir.y;
                this.movementState = MovementStates.Walk;
                this.animationManager.play(`walk-${this.direction}`);
            } else {
                this.movementState = MovementStates.Idle;
                this.animationManager.goToIdle(this.direction);
                this.targetPos = ex.vec(0, 0);
                
                // Continue to next cutscene event after walk completes
                if (this.currentCutscene && !this.currentCutscene.isComplete()) {
                    this.currentCutscene.continueToNextEvent();
                }
            }
        }
    }

    // Getter for backward compatibility
    get numTalkingIndexes(): number {
        return this.currentCutscene ? this.currentCutscene.maxIndex : 0;
    }

    get currentTalkingIndex(): number {
        return this.currentCutscene ? this.currentCutscene.currentIndex : 0;
    }
}