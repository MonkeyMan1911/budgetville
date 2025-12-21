import { Player } from "../objects/player"
import { ChoiceBox, ChoiceBoxConfig } from "./ChoiceBox"

export interface DialogueMenuConfig {
    numChoices: number,
    choicesContent: ChoiceBoxConfig[],
    playerRef: Player,
    onChoiceMade: () => void
}

export class DialogueMenu {
    private choicesDiv: HTMLElement
    private hasChosenOption: boolean = false
    private choicesBoxes: ChoiceBox[] = []
    private onChoiceMade: () => void
    private playerRef: Player

    constructor(config: DialogueMenuConfig) {
        this.choicesDiv = document.getElementById("choices-div")!
        this.choicesDiv.classList.remove("hide")
        this.choicesDiv.classList.add("show")

        this.onChoiceMade = config.onChoiceMade
        this.playerRef = config.playerRef

        let currentNum = 1
        config.choicesContent.forEach(choice => {
            let choiceBtn = new ChoiceBox(currentNum, choice, config.playerRef, (flag: string) => this.handleChoice(flag))
            this.choicesBoxes.push(choiceBtn)
            choiceBtn.show()
            currentNum += 1
        }) 
    }

    private handleChoice(flag: string): void {
        if (this.hasChosenOption) return

        this.hasChosenOption = true 
        this.finishChoice()
        
        // Track this as a temporary flag in the cutscene
        if (this.playerRef.currentCutscene) {
            this.playerRef.currentCutscene.addTemporaryFlag(flag);
        }
        
        // Notify that choice was made
        this.onChoiceMade()
        
        // Now continue to next event (which will skip messages without proper flags)
        if (this.playerRef.currentCutscene) {
            this.playerRef.currentCutscene.incrementIndex();
            this.playerRef.currentCutscene.continueToNextEvent()
        }
    }

    public isWaitingForChoice(): boolean {
        return !this.hasChosenOption
    }

    public finishChoice(): void {
        this.choicesBoxes.forEach(box => box.hide())
        this.choicesBoxes = []

        this.choicesDiv.classList.remove("show")
        this.choicesDiv.classList.add("hide")   
    }
}