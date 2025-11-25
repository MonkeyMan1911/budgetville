import { Actor, Collider, CollisionContact, Engine, Side, vec, Keys, Vector, CollisionType } from "excalibur";
import * as ex from "excalibur"
import { Resources } from "../resources";
import { AnimationManager } from "../Animations/AnimationManager";
import DoorObject from "./DoorObject";
import { UIKey } from "./UIKey";
import { NPC } from "./NPC";
import { gameTextBox } from "../UI/Textbox";

export enum Directions {
	Up = "up",
	Down = "down",
	Left = "left",
	Right = "right",
}
export enum MovementStates {
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
	
	public canMove: boolean = true
	public direction: Directions = Directions.Down
	private movementState: MovementStates = MovementStates.Idle
	animationManager: AnimationManager = new AnimationManager({
		spritesheet: this.spriteSheet,
		actor: this
	})

	private collidingWithDoor: boolean = false;
	private currentDoor: DoorObject | null = null;

	public enterKey: UIKey;
	private enterKeyShown: boolean = false;
	public eKey: UIKey;
	private eKeyShown: boolean = false;

	private collidingWithNpc: boolean = false;
	private currentNpc: NPC | null = null;

	private talking: boolean = false

	public balance: number = 0.0

	constructor(enterKey: UIKey, eKey: UIKey) {
		super({
			name: 'Player',
			pos: vec(192, 192),
			width: 16,
			height: 16,
			collisionType: CollisionType.Active, // Collision Type Active means this participates in collisions read more https://excaliburjs.com/docs/collisiontypes
		});

		this.enterKey = enterKey
		this.eKey = eKey
	}

	override onInitialize() {
		this.animationManager.play("idle-down")
	}

	private movementLogic(engine: Engine) {
		const keyboard = engine.input.keyboard

		let moveDir: Vector = Vector.Zero
		let speed: number = 1.3

		const ignoredKeys: Keys[] = [Keys.ShiftLeft, Keys.ShiftRight]

		if (keyboard.getKeys().length > 2 && ignoredKeys.every(key => !keyboard.getKeys().includes(key))) {
			moveDir = Vector.Zero;
			this.movementState = MovementStates.Idle;
			this.animationManager.goToIdle(this.direction);
			return;
		}
		else if (keyboard.isHeld(Keys.Down) || keyboard.isHeld(Keys.S)) {
			this.direction = Directions.Down
			moveDir = moveDir.add(Vector.Down)
		}
		else if (keyboard.isHeld(Keys.Up) || keyboard.isHeld(Keys.W)) {
			this.direction = Directions.Up
			moveDir = moveDir.add(Vector.Up)
		}
		else if (keyboard.isHeld(Keys.Right) || keyboard.isHeld(Keys.D)) {
			this.direction = Directions.Right
			moveDir = moveDir.add(Vector.Right)
		}
		else if (keyboard.isHeld(Keys.Left) || keyboard.isHeld(Keys.A)) {
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

				this.movementState = MovementStates.Walk
				this.animationManager.play(`walk-${this.direction}`)
		}

		// Return to idle if not moving anymore
		if (moveDir.equals(Vector.Zero) && this.movementState !== MovementStates.Idle) {
			this.animationManager.goToIdle(this.direction)
			this.movementState = MovementStates.Idle
		}
	}

	private async enterLogic(engine: Engine, other?: "door" | "npc" | "textbox") {
		const keyboard = engine.input.keyboard

		if (keyboard.wasPressed(Keys.Enter) && other === "door") {
			const targetScene = this.currentDoor?.leadsTo;
			const newDirection = this.currentDoor?.properties![0].value as Directions;
			const newX = (this.currentDoor?.properties?.[1]?.value as number ?? 0) * 16 + 8;
			const newY = (this.currentDoor?.properties?.[2]?.value as number ?? 0) * 16;

			// Now change the scene
			await engine.goToScene(targetScene);
			this.enterKey.hide()

			// Update player state
			this.movementState = MovementStates.Idle;
			this.direction = newDirection;
			this.animationManager.goToIdle(this.direction);
			this.pos = vec(newX, newY);
		}

		if (keyboard.wasPressed(Keys.E) && other === "npc" && !this.talking) {
			this.movementState = MovementStates.Idle
			this.animationManager.goToIdle(this.direction)

			this.canMove = false
			this.currentNpc?.assignTalking()
			this.currentNpc?.continueTalking(this.currentNpc?.currentTalkingIndex, this)
			this.eKey.hide()
			this.talking = true
		}

		if (keyboard.wasPressed(Keys.Enter) && other === "textbox") {

			if (gameTextBox.typing) {
				gameTextBox.skipTyping();
				return;
			}

			if (this.currentNpc!.currentTalkingIndex <= this.currentNpc!.numTalkingIndexes) {
				this.currentNpc?.continueTalking(this.currentNpc.currentTalkingIndex, this)
			}
			else {
				gameTextBox.clear()
				gameTextBox.hide()
				this.currentNpc!.currentTalkingIndex = 0
				this.currentNpc!.numTalkingIndexes = 0
				this.talking = false
				this.canMove = true

				this.collidingWithNpc = false
				this.currentNpc = null
				this.eKey.hide()
				this.eKeyShown = false
			}
		}
	}

	override onPreUpdate(engine: Engine, elapsedMs: number): void {
		// Only allow movement if no high-priority animation is playing
		if (this.animationManager.currentAnimationPriority < 10 && this.canMove && !gameTextBox.isVisible) {
			this.movementLogic(engine);
		}
		if (this.collidingWithDoor) {
			this.enterLogic(engine, "door");
		}
		if (this.collidingWithNpc) {
			this.enterLogic(engine, "npc")
		}
		if (gameTextBox.isVisible) {
			this.enterLogic(engine, "textbox")
		}
	}

	override onPostUpdate(engine: Engine, elapsedMs: number): void {
		// Put any update logic here runs every frame after Actor builtins
	}

	override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		// Called before a collision is resolved, if you want to opt out of this specific collision call contact.cancel()		
		if (other.owner instanceof DoorObject) {
			this.collidingWithDoor = true
			this.currentDoor = other.owner
			if (!this.enterKeyShown) {
				this.enterKey.setPos(ex.vec(other.owner.pos.x + (other.owner.width / 2), other.owner.pos.y - 20))
				this.enterKey.show()
				this.enterKeyShown = true
			}
		}	

		if (other.owner instanceof NPC || other.owner?.parent instanceof NPC) {
			this.collidingWithNpc = true
			const otherNpc = other.owner instanceof NPC ? other.owner : other.owner.parent as NPC
			this.currentNpc = otherNpc
			if (!this.eKeyShown && !this.talking) {
				this.eKey.setPos(ex.vec(otherNpc.pos.x , otherNpc.pos.y - 15))
				this.eKey.show()
				this.eKeyShown = true
			}
		}
	}

	override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		// Called every time a collision is resolved and overlap is solved
	}

	override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		// Called when a pair of objects are in contact
	}

	override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
		// Called when a pair of objects separates
		if (other.owner instanceof DoorObject) {
			this.collidingWithDoor = false
			this.currentDoor = null
			this.enterKey.hide()
			this.enterKeyShown = false
		}	

		if (other.owner instanceof NPC && !this.talking || other.owner?.parent instanceof NPC) {
			if (!this.talking) {
				this.collidingWithNpc = false
				this.currentNpc = null
				this.eKey.hide()
				this.eKeyShown = false
				this.talking = false
			}
		}
	}
}
