import * as ex from "excalibur"

export class UIKey extends ex.Actor {
    
    private keySprite!: ex.SpriteSheet;
    private keyAnimation!: ex.Animation;
    private keyImg: ex.ImageSource;

    constructor(name: string, pos: ex.Vector, keyImg: ex.ImageSource) {
        super({
            name: name,
            pos: pos,
            visible: false,
            z: 52
        })
        
        this.keyImg = keyImg;
    }

    onInitialize(engine: ex.Engine): void {
        const frameHeight = this.keyImg.height / 2;
        const frameWidth = this.keyImg.width;
        
        // Set the collider size (this sets the actor bounds)
        this.collider.set(ex.Shape.Box(frameWidth, frameHeight));

        this.keySprite = ex.SpriteSheet.fromImageSource({
            image: this.keyImg,
            grid: {
                rows: 2,
                columns: 1,
                spriteHeight: frameHeight,
                spriteWidth: frameWidth
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
        
        this.graphics.use(this.keyAnimation);
    }

    setPos(pos: ex.Vector): void {
        this.pos = pos
    }

    show(): void {
        this.graphics.isVisible = true
    }

    hide(): void {
        this.graphics.isVisible = false
    }
}