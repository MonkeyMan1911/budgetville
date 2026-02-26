import * as ex from "excalibur"

class Joystick extends ex.Actor {
    private isPressed = false;
    private innerStick: ex.Actor;
    private maxRadius = 30;
    private engine: ex.Engine | null = null;
    
    constructor() {
        super({
            x: 100,
            y: 6000,
            z: 999,
            collisionType: ex.CollisionType.PreventCollision
        })
        
        // Outer circle (stationary, gray)
        this.graphics.use(new ex.Circle({radius: 30, color: ex.Color.fromHex("#93939369")}))
        
        this.pointer.useGraphicsBounds = true;
        
        // Inner stick (draggable, smaller, darker)
        this.innerStick = new ex.Actor({
            pos: this.pos.clone(),
            z: 1000,
            collisionType: ex.CollisionType.PreventCollision
        });
        this.innerStick.graphics.use(new ex.Circle({radius: 15, color: ex.Color.fromHex("#43434343")}));
        
        this.on("pointerdown", (evt) => {
            this.isPressed = true;
        });
    } 
    
    onInitialize(engine: ex.Engine): void {
        this.engine = engine;
        
        // Add the inner stick to the scene
        engine.currentScene.add(this.innerStick);
        
        // Listen for global pointerup event to catch releases outside the joystick
        engine.input.pointers.primary.on("up", () => {
            if (this.isPressed) {
                this.isPressed = false;
                // Reset inner stick to center
                this.innerStick.pos = this.pos.clone();
            }
        });
        
        // Listen for global pointermove ONLY when pressed
        engine.input.pointers.primary.on("move", (evt) => {
            if (this.isPressed) {
                const worldPos = engine.screen.screenToWorldCoordinates(evt.screenPos);
                let direction = worldPos.sub(this.pos);
                
                // Clamp the distance to maxRadius
                if (direction.size > this.maxRadius) {
                    direction = direction.normalize().scale(this.maxRadius);
                }
                
                // Update inner stick position
                this.innerStick.pos = this.pos.add(direction);
            }
        });
    }
    
    onPreUpdate(engine: ex.Engine, elapsed: number): void {
        // Keep joystick in screen space (bottom left corner)
        const screenPos = engine.screen.worldToScreenCoordinates(this.pos);
        const targetScreenPos = ex.vec(100, engine.screen.resolution.height - 100);
        
        if (!screenPos.equals(targetScreenPos)) {
            const newWorldPos = engine.screen.screenToWorldCoordinates(targetScreenPos);
            const offset = this.innerStick.pos.sub(this.pos);
            
            this.pos = newWorldPos;
            this.innerStick.pos = newWorldPos.add(offset);
        }
    }
    
    // Helper method to get joystick direction (normalized vector)
    getDirection(): ex.Vector {
        if (!this.isPressed) return ex.Vector.Zero;
        
        const direction = this.innerStick.pos.sub(this.pos);
        if (direction.size === 0) return ex.Vector.Zero;
        
        return direction.normalize();
    }
    
    // Helper method to get joystick magnitude (0-1)
    getMagnitude(): number {
        if (!this.isPressed) return 0;
        
        const distance = this.innerStick.pos.sub(this.pos).size;
        return Math.min(distance / this.maxRadius, 1);
    }
}

export const joystick = new Joystick()