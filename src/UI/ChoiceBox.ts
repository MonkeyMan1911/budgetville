import { Player } from "../objects/player";

export interface ChoiceBoxConfig {
    content: string,
    flag: string
}

export class ChoiceBox {
    private element: HTMLElement;
    public flag: string;
    private onClickCallback: (flag: string) => void;

    constructor(boxNum: number, config: ChoiceBoxConfig, playerRef: Player, onClickCallBack: (flag: string) => void) {
        this.element = document.getElementById(`choice-${boxNum}`)!
        this.element.innerText = config.content
        this.flag = config.flag

        this.onClickCallback = onClickCallBack

        this.element.addEventListener("click", () => this.handleClick(playerRef))   
    }

    show() {
        this.element.classList.remove("hide")
        this.element.classList.add("show")
    }

    hide() {
        this.element.innerText = ""
        this.element.classList.remove("show")
        this.element.classList.add("hide")
    }
    
    handleClick(playerRef: Player) {
        playerRef.cutsceneFlags.push(this.flag)
        window.localStorage.setItem(this.flag, JSON.stringify(true));
        
        console.log(playerRef.cutsceneFlags)
        
        // Call the callback with the flag name so it can be tracked
        this.onClickCallback(this.flag)
    }
}