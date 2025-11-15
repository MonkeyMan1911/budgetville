import * as ex from "excalibur"
import { Directions, MovementStates } from "./player";
import { AnimationManager } from "../Animations/AnimationManager";


export interface NPCTalkingEvent {
    type: string,
    text: string
}

export interface NPCTalking {
    requiredFlags? : string[],
    events: NPCTalkingEvent[]
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

    talk() {
        console.log("Helo")
    }
}