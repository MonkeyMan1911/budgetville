import * as ex from "excalibur";
import rawData from './animations.json' assert { type: "json" };

// Make a class called AnimationManager that handles animations for a given actor
// Takes following paramaters - spritesheet, actor
// Has following class variables - currentAnimation, animations
/* Has following methods:      
    - play(animationName): plays an animation
    - end(): ends current animation
    - addAnimation(animations:  Array)
*/

interface AnimationManagerConfig {
    spritesheet: ex.SpriteSheet;
    actor: ex.Actor;
}

// #region Animation Data Processing
type AnimationStrategyKey = keyof typeof ex.AnimationStrategy;
interface AnimationEntry {
    name: string,
    frames: Array<{ x: number, y: number }>,
    dpf: number,
    priority: number,
    strategy: AnimationStrategyKey,
}
type AnimationData = Record<string, AnimationEntry>;
type JSONAnimationType = Record<string, AnimationData>; // Larger anim type obj type
const animations = rawData as JSONAnimationType
// #endregion

export class AnimationManager {

    spriteSheet: ex.SpriteSheet
    actor: ex.Actor

    currentAnimation: string | null = null
    currentAnimationPriority: number = -1
    storedAnimations: Record<string, ex.Animation> = {}

    constructor(config: AnimationManagerConfig) {
        this.spriteSheet= config.spritesheet
        this.actor = config.actor
    }

    private getAnimation(animationName: string, animationData: AnimationEntry): ex.Animation {
        let animation: ex.Animation

        if (this.storedAnimations[animationName] === undefined) {
            animation = ex.Animation.fromSpriteSheetCoordinates({
                spriteSheet: this.spriteSheet,
                durationPerFrame: animationData.dpf,
                frameCoordinates: animationData.frames,
                strategy: ex.AnimationStrategy[animationData.strategy]
            })

            this.storedAnimations[animationName] = animation
        }
        else {
            animation = this.storedAnimations[animationName]
        }

        return animation
    }

    play(animationName: string) {
        const animationType = animationName.split("-")[0]
        const animationDirection = animationName.split("-")[1]
        const animationData = animations[animationType][animationDirection]

        if (animationData.priority < this.currentAnimationPriority) {
            return;
        }

        if (this.currentAnimation !== animationName) {

            let animation: ex.Animation = this.getAnimation(animationName, animationData)
            
            this.currentAnimation = animationName
            this.currentAnimationPriority = animationData.priority

            animation.reset()
            this.actor.graphics.use(animation)

            if (animation.canFinish) {
                animation.events.once("end", () => {
                    this.currentAnimation = null
                    this.currentAnimationPriority = -1
                    this.goToIdle(animationDirection)
                }) 
            }
        }
    }

    goToIdle(direction: string) {
        const animationData = animations["idle"][direction]
        const animationName = `idle-${direction}`
        const animation = this.getAnimation(animationName, animationData)
        this.currentAnimation = animationName
        this.currentAnimationPriority = animationData.priority
        this.actor.graphics.use(animation)
    }
}