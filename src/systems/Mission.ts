import * as ex from "excalibur"

type MissionDetails = ({ type: "travel"; value: ex.Vector } | { type: "collectFlag"; value: string }) & { name: string, description: string }

export default class Mission {
    private name: string;
    private details: MissionDetails;

    constructor(details: MissionDetails) {
        this.name = details.name
        this.details = details
    }   

    public getName(): string {
        return this.name
    }
    public getDescription(): string {
        return this.details.description
    }
    public getType(): string {
        return this.details.type
    }


    public checkFinished(currentPos?: ex.Vector): boolean {
        if (this.details.type === "travel" && currentPos) {
            // TriggerZone handles this now, but keep as fallback with distance check
            return currentPos.distance(this.details.value as ex.Vector) < 16
        }
        if (this.details.type === "collectFlag") {
            return window.localStorage.getItem(this.details.value as string) !== null
        }
        return false
    }
}