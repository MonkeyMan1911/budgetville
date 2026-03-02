import * as ex from "excalibur"

class ActionButton extends ex.Actor {

    private pressed = false;

    constructor() {
        super({
            x: 800,
            y: 6000,
            z: 999,
            collisionType: ex.CollisionType.PreventCollision
        })

        this.graphics.use(new ex.Circle({radius: 30, color: ex.Color.fromHex("#93939369")}))

        this.on("pointerdown", () => {
            this.graphics.use(new ex.Circle({radius: 30, color: ex.Color.fromHex("#43434343")}));
            this.pressed = true
        })
        this.on("pointerup", () => {
            this.graphics.use(new ex.Circle({radius: 30, color: ex.Color.fromHex("#93939369")}));
            this.pressed = false
        })
    }

    isPressed(): boolean {
        return this.pressed
    }

    onPreUpdate(engine: ex.Engine): void {
        // Pin to bottom-right corner in screen space, same approach as joystick
        const screenPos = engine.screen.worldToScreenCoordinates(this.pos);
        const targetScreenPos = ex.vec(700, engine.screen.resolution.height - 100);
        
        if (!screenPos.equals(targetScreenPos)) {
            const newWorldPos = engine.screen.screenToWorldCoordinates(targetScreenPos);
            
            this.pos = newWorldPos;
        }
    }

    hide() {
        this.graphics.isVisible = false
    }

    show() {
        this.graphics.isVisible = true
    }
}

export const actionButton = new ActionButton()