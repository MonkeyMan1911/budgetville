import * as ex from "excalibur"

type MissionDetails = ({ type: "travel"; value: ex.Vector } | { type: "collectFlag"; value: string }) & { name: string, description: string }

export default class Mission {
    private name: string;
    private details: MissionDetails;

    constructor(details: MissionDetails) {
        this.name =      details.name
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


    public checkFinished(currentValue?: MissionDetails["value"]): boolean {
        if (this.details.type === "travel" && currentValue === this.details.value) {
            return true
        }   
        if (this.details.type === "collectFlag") {
            if (window.localStorage.getItem(this.details.value) !== null) {
                return true
            }
        }

        return false
    }
}