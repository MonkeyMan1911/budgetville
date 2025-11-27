import { Actor, Collider, CollisionContact, Engine, Side, vec, Keys, Vector, CollisionType } from "excalibur";
import * as ex from "excalibur"
import { Resources } from "../resources";
import { AnimationManager } from "../Animations/AnimationManager";
import DoorObject from "./DoorObject";
import { UIKey } from "./UIKey";
import { NPC } from "./NPC";
import { gameTextBox } from "../UI/Textbox";
import { Cutscene } from "../Cutscene";
import { WalkingEvent } from "./NPC";
import { calculateDistance } from "../utils/calculateDistance";

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

	private currentCutscene: Cutscene | null = null;

	public balance: number = 0.0

	// For cutscene walking
	private targetPos: ex.Vector = ex.Vector.Zero;
	private speed: number = 1.3;
	private moveDir: ex.Vector = ex.Vector.Zero;
	private walkCompleteCallback: (() => void) | null = null;

	constructor(enterKey: UIKey, eKey: UIKey) {
		super({
			name: 'Player',
			pos: vec(192, 192),
			width: 16,
			height: 16,
			collisionType: CollisionType.Active,
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

		if (keyboard.isHeld(Keys.ShiftLeft) || keyboard.isHeld(Keys.ShiftRight)) { speed *= 1.3 }

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

			await engine.goToScene(targetScene);
			this.enterKey.hide()

			this.movementState = MovementStates.Idle;
			this.direction = newDirection;
			this.animationManager.goToIdle(this.direction);
			this.pos = vec(newX, newY);
		}

		if (keyboard.wasPressed(Keys.E) && other === "npc" && !this.currentCutscene) {
			this.canMove = false
			const talkingData = this.currentNpc?.getTalkingData();
			
			if (talkingData) {
				this.animationManager.goToIdle(this.direction)
				this.currentCutscene = new Cutscene(talkingData);
				this.currentCutscene.start(this, engine.currentScene as any, this.currentNpc!);
			}
			
			this.eKey.hide()
		}

		if (keyboard.wasPressed(Keys.Enter) && other === "textbox") {
			if (gameTextBox.typing) {
				gameTextBox.skipTyping();
				return;
			}

			if (this.currentCutscene && !this.currentCutscene.isComplete()) {
				this.currentCutscene.continueToNextEvent();
			}
			else if (this.currentCutscene) {
				// Cutscene is complete
				this.endCutscene();
			}
		}
	}

	public endCutscene() {
		gameTextBox.clear();
		gameTextBox.hide();
		
		if (this.currentCutscene) {
			this.currentCutscene.reset();
			this.currentCutscene = null;
		}
		
		this.canMove = true;
		this.collidingWithNpc = false;
		this.currentNpc = null;
		this.eKey.hide();
		this.eKeyShown = false;
	}

	// Method for cutscene to tell player to walk
	walkForCutscene(walkEvent: WalkingEvent, onComplete: () => void) {
		const amountToWalk = calculateDistance(walkEvent.tiles);
		this.direction = walkEvent.direction;
		this.walkCompleteCallback = onComplete;
		 
		let moveDir = ex.Vector.Zero;
		switch (walkEvent.direction) {
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

	override onPreUpdate(engine: Engine, elapsedMs: number): void {
		// Handle cutscene walking
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
				
				if (this.walkCompleteCallback) {
					this.walkCompleteCallback();
					this.walkCompleteCallback = null;
				}
				
				// Check if cutscene is complete after walk
				if (this.currentCutscene && this.currentCutscene.isComplete()) {
					this.endCutscene();
				}
			}
		}
		// Normal movement
		else if (this.animationManager.currentAnimationPriority < 10 && this.canMove && !gameTextBox.isVisible) {
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

	override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
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
			if (!this.eKeyShown && !this.currentCutscene) {
				this.eKey.setPos(ex.vec(otherNpc.pos.x, otherNpc.pos.y - 15))
				this.eKey.show()
				this.eKeyShown = true
			}
		}
	}

	override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
		if (other.owner instanceof DoorObject) {
			this.collidingWithDoor = false
			this.currentDoor = null
			this.enterKey.hide()
			this.enterKeyShown = false
		}	

		if (other.owner instanceof NPC || other.owner?.parent instanceof NPC) {
			if (!this.currentCutscene) {
				this.collidingWithNpc = false
				this.currentNpc = null
				this.eKey.hide()
				this.eKeyShown = false
			}
		}
	}
}

export let player: Player = null as any;

export function initializePlayer(enterKey: UIKey, eKey: UIKey): Player {
	player = new Player(enterKey, eKey);
	player.z = 42;
	return player;
}