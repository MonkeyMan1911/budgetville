import { game } from "../main";
import { pauseMenu } from "./PauseMenu";

class PauseButton {
    private element: HTMLButtonElement;

    private paused: boolean = false;

    constructor() {
        this.element = document.getElementById("pause-btn")! as HTMLButtonElement

        this.element.addEventListener("click", () => {
            // TODO: show pause menu once its made 
            if (!this.paused) {   
                game.stop()
                this.paused = true
                pauseMenu.show()
            }
            else {
                game.start()
                this.paused = false
                pauseMenu.hide()
            }
        })
    }

    click() {
        this.element.click()
    }

    show() {
        this.element.classList.remove("hide")
        this.element.classList.add("show")
    }

    hide() {
        this.element.classList.remove("show")
        this.element.classList.add("hide")
    }
}

export const pauseBtn = new PauseButton()

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        pauseBtn.click()
    }
})