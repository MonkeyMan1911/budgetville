/* 
This class will handle all cutscenes 
    1. Refactor code from npc to here
*/

import { NPCTalking, TalkingEvent, WalkingEvent } from "./objects/NPC";
import { Directions, Player } from "./objects/player";
import { gameTextBox } from "./UI/Textbox";

export class Cutscene {
    private cutsceneData: NPCTalking;
    private numEventIndexes: number = 0;
    private currentEventIndex: number = 0;
    private playerRef: Player | null = null;
    
    // Callback for walk events - NPC will provide this
    private onWalkEvent: ((event: WalkingEvent) => void) | null = null;
    // Callback for face direction - NPC will provide this
    private onFaceDirection: ((direction: Directions) => void) | null = null;

    constructor(cutsceneData: NPCTalking) {
        this.cutsceneData = cutsceneData;
        this.numEventIndexes = cutsceneData.events.length - 1;
    }

    setWalkCallback(callback: (event: WalkingEvent) => void) {
        this.onWalkEvent = callback;
    }

    setFaceDirectionCallback(callback: (direction: Directions) => void) {
        this.onFaceDirection = callback;
    }

    start(player: Player) {
        this.playerRef = player;
        this.currentEventIndex = 0;
        this.continueToNextEvent();
    }

    continueToNextEvent() {
        if (!this.playerRef) return;

        const eventObj = this.cutsceneData.events[this.currentEventIndex];
        
        if (eventObj?.type === "textMessage") {
            this.handleTextMessage(eventObj as TalkingEvent);
            this.currentEventIndex += 1;
        }    
        else if (eventObj?.type === "walk") {
            this.handleWalk(eventObj as WalkingEvent);
            this.currentEventIndex += 1;
        }
        else if (eventObj?.type === "addFlag") {
            window.localStorage.setItem(eventObj.flag, eventObj.value);
            this.currentEventIndex += 1;

            if (this.currentEventIndex <= this.numEventIndexes) {
                this.continueToNextEvent();
            }
        }
        else if (eventObj?.type === "removeFlag") {
            window.localStorage.removeItem(eventObj.flag);
            this.currentEventIndex += 1;
            
            if (this.currentEventIndex <= this.numEventIndexes) {
                this.continueToNextEvent();
            }
        }
    }

    private handleTextMessage(eventObj: TalkingEvent) {
        gameTextBox.clear();
        gameTextBox.addText(eventObj.text);
        gameTextBox.show();
        
        const direction = eventObj.direction === "mainChar" ? this.calculateFacePlayerDirection() : eventObj.direction;
            
        if (this.onFaceDirection) {
            this.onFaceDirection(direction);
        }
    }

    private handleWalk(eventObj: WalkingEvent) {
        gameTextBox.clear();
        gameTextBox.hide();
        
        if (this.onWalkEvent) {
            this.onWalkEvent(eventObj);
        }
    }

    private calculateFacePlayerDirection(): Directions {
        if (!this.playerRef || !this.onFaceDirection) return Directions.Down;
        
        // This will be calculated by the NPC based on positions
        // For now, return a default
        return Directions.Down;
    }

    isComplete(): boolean {
        return this.currentEventIndex > this.numEventIndexes;
    }

    reset() {
        this.currentEventIndex = 0;
        this.playerRef = null;
    }

    get currentIndex(): number {
        return this.currentEventIndex;
    }

    get maxIndex(): number {
        return this.numEventIndexes;
    }
}