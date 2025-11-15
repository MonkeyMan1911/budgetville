import * as ex from "excalibur"
import { Directions } from "./objects/player";

export class Progress {

    public currentMap: string;
    public playerPos: ex.Vector;
    public playerDirection: Directions;

    public saveKey: string;

    constructor() {
        this.currentMap = "World"
        this.playerPos = ex.vec(192, 192)
        this.playerDirection = Directions.Down
        this.saveKey = "Budgetville_Save1"
    }

    public save(): void {
        window.localStorage.setItem(this.saveKey, JSON.stringify({
            
        }))
    }

    public getSaveFile(): Object | null {
        const file = window.localStorage.getItem(this.saveKey)
        return file ? JSON.parse(file) : null
    }

    load() {
        const file = this.getSaveFile()
        if (file) {
            //this.currentMap = file.mapId
            // this.startingHeroX = file.startingHeroX
            // this.startingHeroY = file.startingHeroY
            // this.startingHeroDirection = file.startingHeroDirection
            // Object.keys(file.playerState).forEach(key => {
            //     playerState[key] = file.playerState[key]
            // })
        }
    }
}