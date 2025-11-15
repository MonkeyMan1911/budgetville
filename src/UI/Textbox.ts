import * as ex from "excalibur"

export const calculatePixelConversion = (screen: ex.Screen) => {
    const origin = screen.worldToPageCoordinates(ex.Vector.Zero);
    const singlePixel = screen.worldToPageCoordinates(ex.vec(1, 0)).sub(origin);
    const pixelConversion = singlePixel.x;
    document.documentElement.style.setProperty('--pixel-conversion', pixelConversion.toString());
}

export class Textbox {
    private element: HTMLElement;

    constructor() {
        this.element = document.getElementById("textbox")!; 
    }

    isVisible(): boolean {
        return this.element.classList.contains("show")
    }

    show() {
        this.element.classList.remove("hide")
        this.element.classList.add("show")
    }

    hide() {
        this.element.classList.remove("show")
        this.element.classList.add("hide")
    }

    addText(text: string) {
        this.element.innerText = text
    }

    clear() {
        this.element.innerText = ""
    }
}

export const gameTextBox = new Textbox()