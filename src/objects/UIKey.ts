import * as ex from "excalibur"

export class UIKey extends ex.Actor {
    
    private keySprite: ex.SpriteSheet;
    private keyAnimation: ex.Animation;

    constructor(name: string, pos: ex.Vector, keyImg: ex.ImageSource) {
        super({
            name: name,
            pos: pos,
            height: keyImg.height / 2 ,
            width: keyImg.width,
            visible: false,
            z: 41
        })

        this.keySprite = ex.SpriteSheet.fromImageSource({
            image: keyImg,
            grid: {
                rows: 2,
                columns: 1,
                spriteHeight: this.height,
                spriteWidth: this.width
            }
        })

        this.keyAnimation = ex.Animation.fromSpriteSheetCoordinates({
            spriteSheet: this.keySprite,
            durationPerFrame: 750,
            frameCoordinates: [
                {x: 0, y: 0},
                {x: 0, y: 1}
            ]
        })
    }

    onInitialize(engine: ex.Engine): void {
        this.graphics.use(this.keyAnimation)
    }

    setPos(pos: ex.Vector): void {
        this.pos = pos
    }

    show(): void {
        this.graphics.isVisible = true
        this.graphics.use(this.keyAnimation)
    }

    hide(): void {
        this.graphics.isVisible = false
    }
}