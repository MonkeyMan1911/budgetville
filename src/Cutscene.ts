import { NPCTalking, TalkingEvent, WalkingEvent, AddFlagEvent, RemoveFlagEvent, TransactionEvent } from "./objects/NPC";
import { Directions, Player } from "./objects/player";
import { gameTextBox } from "./UI/Textbox";
import { GameScene } from "./scenes/GameScene";
import { NPC } from "./objects/NPC";
import { balanceDiv } from "./UI/BalanceUI";
import { DialogueMenu } from "./UI/DialogueMenu";

export class Cutscene {
    private cutsceneData: NPCTalking;
    private numEventIndexes: number = 0;
    private currentEventIndex: number = 0;
    private playerRef: Player | null = null;
    private gameSceneRef: GameScene | null = null;
    private initiatingNPC: NPC | null = null;
    private currentDialogueMenu: DialogueMenu | null = null;    

    constructor(cutsceneData: NPCTalking) {
        this.cutsceneData = cutsceneData;
        this.numEventIndexes = cutsceneData.events.length - 1;
    }

    start(player: Player, gameScene: GameScene, initiatingNPC?: NPC) {
        this.playerRef = player;
        this.gameSceneRef = gameScene;
        this.initiatingNPC = initiatingNPC || null;
        this.currentEventIndex = 0;
        this.continueToNextEvent();
    }

    continueToNextEvent() {
        if (!this.playerRef || !this.gameSceneRef) return;

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
            this.handleAddFlag(eventObj as AddFlagEvent);
            this.currentEventIndex += 1;
            
            if (this.currentEventIndex <= this.numEventIndexes) {
                this.continueToNextEvent();
            }
        }
        else if (eventObj?.type === "removeFlag") {
            this.handleRemoveFlag(eventObj as RemoveFlagEvent);
            this.currentEventIndex += 1;
            
            if (this.currentEventIndex <= this.numEventIndexes) {
                this.continueToNextEvent();
            }
        }
        else if (eventObj?.type === "transaction") {
            this.handleTransaction(eventObj as TransactionEvent)
            this.currentEventIndex += 1;

            if (this.currentEventIndex <= this.numEventIndexes) {
                this.continueToNextEvent();
            }
            else {
                this.playerRef.endCutscene()
            }
        }
    }

    private handleTransaction(eventObj: TransactionEvent) {
        gameTextBox.clear()
        gameTextBox.hide()
        this.playerRef!.balance += eventObj.amount
        balanceDiv.updateBalance(this.playerRef!.balance)
    }

    private handleTextMessage(eventObj: TalkingEvent) {

        if (eventObj.requireFlags) {
            for (const flag of eventObj.requireFlags) {
                //console.log(window.localStorage.getItem(flag)) TODO: String to bool or smth idek bruh
                if (!window.localStorage.getItem(flag)) {
                    if (this.currentEventIndex <= this.numEventIndexes) {
                        this.continueToNextEvent();
                    } else {
                        this.playerRef?.endCutscene();
                    }

                    return;
                }
            }
        }

        gameTextBox.clear();
        gameTextBox.addText(eventObj.text);
        gameTextBox.show();

        if (eventObj.choices) {
            const dialogueMenu = new DialogueMenu({
                numChoices: eventObj.choices.length,
                choicesContent: eventObj.choices,
                playerRef: this.playerRef!,
                onChoiceMade: () => {
                    this.currentDialogueMenu = null;
                    this.currentEventIndex += 1;
                    
                    if (this.currentEventIndex <= this.numEventIndexes) {
                        this.continueToNextEvent()  
                    } 
                    else {
                        this.playerRef?.endCutscene();
                    }
                }
            })
        }
        
        // Calculate which direction the NPC should face
        if (this.initiatingNPC) {
            let direction: Directions = Directions.Down; // Initialize with a default
            if (eventObj.direction === "currentDir") {
                direction = this.initiatingNPC.direction
            }
            else if (eventObj.direction === "mainChar") {
                direction = this.calculateFacePlayerDirection()
            }
            else {
                direction = eventObj.direction as Directions; // Type assertion
            }
            this.initiatingNPC.faceDirection(direction);
        }
    }

    private handleWalk(eventObj: WalkingEvent) {
        gameTextBox.clear();
        gameTextBox.hide();
        
        // Determine who should walk
        const walker = this.getWalker(eventObj.who);
        
        if (walker) {
            walker.walkForCutscene(eventObj, () => {
                // Callback when walk completes
                if (this.currentEventIndex <= this.numEventIndexes) {
                    this.continueToNextEvent();
                }
                else {
                    this.playerRef?.endCutscene()
                }
            });
        }
    }

    private handleAddFlag(eventObj: AddFlagEvent) {
        window.localStorage.setItem(eventObj.flag, eventObj.value);
    }

    private handleRemoveFlag(eventObj: RemoveFlagEvent) {
        window.localStorage.removeItem(eventObj.flag);
    }

    private getWalker(who?: string): NPC | Player | null {
        if (!who || who === "player") {
            return this.playerRef;
        }
        
        // Find NPC by name in the game scene
        if (this.gameSceneRef) {
            const actors = this.gameSceneRef.actors;
            for (const actor of actors) {
                if (actor instanceof NPC && actor.name === who) {
                    return actor;
                }
            }
        }
        
        return null;
    }

    private calculateFacePlayerDirection(): Directions {
        if (!this.playerRef || !this.initiatingNPC) return Directions.Down;
        
        const dx = this.playerRef.pos.x - this.initiatingNPC.pos.x;
        const dy = this.playerRef.pos.y - this.initiatingNPC.pos.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? Directions.Right : Directions.Left;
        } 
        else {
            return dy > 0 ? Directions.Down : Directions.Up;
        }
    }

    public isWaitingForChoice(): boolean {
        return this.currentDialogueMenu !== null && this.currentDialogueMenu.isWaitingForChoice()
    }

    isComplete(): boolean {
        return this.currentEventIndex > this.numEventIndexes;
    }

    reset() {
        this.currentEventIndex = 0;
        this.playerRef = null;
        this.gameSceneRef = null;
        this.initiatingNPC = null;
    }

    get currentIndex(): number {
        return this.currentEventIndex;
    }

    get maxIndex(): number {
        return this.numEventIndexes;
    }
}