import { Actor, Collider, CollisionContact, Engine, Side, vec, Keys, Vector, CollisionType } from "excalibur";
import * as ex from "excalibur"
import { Resources } from "./resources";
import { AnimationManager } from "./Animations/AnimationManager";

export enum Directions {
	Up = "up",
	Down = "down",
	Left = "left",
	Right = "right",
}
enum MovementStates {
	Idle = "idle",
	Walk = "walk",
	Hold = "hold"
}

export class Player extends Actor {
	private spriteSheet = ex.SpriteSheet.fromImageSource({
		image: Resources.MainCharacterSpriteSheetImg,
		grid: {
			rows: 20,
			columns: 56,
			spriteHeight: 32,
			spriteWidth: 16
		}
	})
 
	private direction: Directions = Directions.Down
	private movementState: MovementStates = MovementStates.Idle
	animationManager: AnimationManager = new AnimationManager({
		spritesheet: this.spriteSheet,
		actor: this
	})

	constructor() {
		super({
			name: 'Player',
			pos: vec(8, 0),
			width: 16,
			height: 16,
			collisionType: CollisionType.Active, // Collision Type Active means this participates in collisions read more https://excaliburjs.com/docs/collisiontypes
		});
		
	}

	override onInitialize() {
		this.animationManager.play("idle-down")
	}

	private movementLogic(engine: Engine) {
		const keyboard = engine.input.keyboard

		let moveDir: Vector = Vector.Zero
		let speed: number = 1.2

		const ignoredKeys: Keys[] = [Keys.ShiftLeft, Keys.ShiftRight]

		if (keyboard.getKeys().length > 2 && ignoredKeys.every(key => !keyboard.getKeys().includes(key))) {
			moveDir = Vector.Zero;
			this.movementState = MovementStates.Idle;
			this.animationManager.goToIdle(this.direction);
			return;
		}
		if (keyboard.isHeld(Keys.Down) || keyboard.isHeld(Keys.S)) {
			this.direction = Directions.Down
			moveDir = moveDir.add(Vector.Down)
		}
		if (keyboard.isHeld(Keys.Up) || keyboard.isHeld(Keys.W)) {
			this.direction = Directions.Up
			moveDir = moveDir.add(Vector.Up)
		}
		if (keyboard.isHeld(Keys.Right) || keyboard.isHeld(Keys.D)) {
			this.direction = Directions.Right
			moveDir = moveDir.add(Vector.Right)
		}
		if (keyboard.isHeld(Keys.Left) || keyboard.isHeld(Keys.A)) {
			this.direction = Directions.Left
			moveDir = moveDir.add(Vector.Left)
		}


		if (keyboard.isHeld(Keys.ShiftLeft) || keyboard.isHeld(Keys.ShiftRight)) { speed *= 1.3 } // Sprint

		if (!moveDir.equals(Vector.Zero)) {
				moveDir = moveDir.normalize().scale(speed);

				let newPos = this.pos.clone();

				if (moveDir.x !== 0) {
					newPos.x += moveDir.x;
					this.pos.x = newPos.x;
				}
				if (moveDir.y !== 0) {
					newPos.y += moveDir.y;
					this.pos.y = newPos.y;
				}
				//this.pos = this.pos.add(moveDir);

				this.movementState = MovementStates.Walk
				this.animationManager.play(`walk-${this.direction}`)
		}

		// Return to idle if not moving anymore
		if (moveDir.equals(Vector.Zero) && this.movementState !== MovementStates.Idle) {
			this.animationManager.goToIdle(this.direction)
			this.movementState = MovementStates.Idle
		}
	}

	override onPreUpdate(engine: Engine, elapsedMs: number): void {
		// Only allow movement if no high-priority animation is playing
		if (this.animationManager.currentAnimationPriority < 10) {
			this.movementLogic(engine);
		}
	}

	override onPostUpdate(engine: Engine, elapsedMs: number): void {
		// Put any update logic here runs every frame after Actor builtins
	}

	override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		// Called before a collision is resolved, if you want to opt out of this specific collision call contact.cancel()				
	}

	override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		// Called every time a collision is resolved and overlap is solved
	}

	override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		// Called when a pair of objects are in contact
	}

	override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
		// Called when a pair of objects separates
	}
}
