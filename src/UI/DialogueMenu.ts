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

    constructor(config: DialogueMenuConfig) {
        this.choicesDiv = document.getElementById("choices-div")!
        this.choicesDiv.classList.remove("hide")
        this.choicesDiv.classList.remove("show")

        this.onChoiceMade = config.onChoiceMade

        let currentNum = 1
        config.choicesContent.forEach(choice => {
            let choiceBtn = new ChoiceBox(currentNum, choice, config.playerRef, () => this.handleChoice())
            this.choicesBoxes.push(choiceBtn)
            choiceBtn.show()
            currentNum += 1
        }) 
    }

    private handleChoice(): void {
        if (this.hasChosenOption) return

        this.hasChosenOption = true 
        this.finishChoice()
        this.onChoiceMade()
    }

    public isWaitingForChoice(): boolean {
        return !this.hasChosenOption
    }

    public finishChoice(): void {
        this.choicesBoxes.forEach(box => box.hide())
        this.choicesBoxes = []

        this.choicesDiv.classList.remove("show")
        this.choicesDiv.classList.remove("hide")   
    }
}