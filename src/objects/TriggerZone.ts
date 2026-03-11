import * as ex from "excalibur"
import { Player } from "./player"
import { NPCTalking } from "./NPC"
import { Cutscene } from "../Cutscene"
import { isMobile } from "../main"
import { actionButton } from "./ActionButton"
import { joystick } from "./Joystick"

export interface TriggerZoneConfig {
    pos: ex.Vector
    width: number
    height: number
    missionName?: string       // name of mission to complete on entry
    cutscene?: NPCTalking      // optional cutscene to fire after completing
}

export class TriggerZone extends ex.Actor {
    private missionName?: string
    private cutsceneData?: NPCTalking
    private triggered = false

    constructor(config: TriggerZoneConfig) {
        super({
            pos: config.pos,
            width: config.width,
            height: config.height,
            collisionType: ex.CollisionType.Passive,
            z: 0
        })
        this.missionName = config.missionName
        this.cutsceneData = config.cutscene
        this.graphics.isVisible = false
    }

    override onCollisionStart(self: ex.Collider, other: ex.Collider): void {
        if (this.triggered) return
        if (!(other.owner instanceof Player)) return

        const player = other.owner as Player

        // Only fire if the active mission matches
        if (this.missionName) {
            const current = player.getCurrentMission()
            if (!current || current.getName() !== this.missionName) return
        }

        this.triggered = true
        player.removeMission()

        if (this.cutsceneData) {
            player.canMove = false
            const cutscene = new Cutscene(this.cutsceneData)
            player.currentCutscene = cutscene
            player.animationManager.goToIdle(player.direction)

            if (isMobile) {
                actionButton.hide()
                joystick.hide()
            }

            cutscene.start(player, this.scene as any)
        }
    }

    // Allow re-triggering if you want (e.g. repeatable zones)
    reset() {
        this.triggered = false
    }
}