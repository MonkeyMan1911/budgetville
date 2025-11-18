import * as ex from "excalibur"

export const calculatePixelConversion = (screen: ex.Screen) => {
    const origin = screen.worldToPageCoordinates(ex.Vector.Zero);
    const singlePixel = screen.worldToPageCoordinates(ex.vec(1, 0)).sub(origin);
    const pixelConversion = singlePixel.x;
    document.documentElement.style.setProperty('--pixel-conversion', pixelConversion.toString());
}

export class Textbox {
    private element: HTMLElement;
    private isTyping: boolean = false;
    private typingSpeed: number = 30; // milliseconds per character
    private textContent: string = "";

    constructor() {
        this.element = document.getElementById("textbox")!; 
    }

    get isVisible(): boolean {
        return this.element.classList.contains("show")   
    }

    get typing(): boolean {
        return this.isTyping;
    }

    show() {
        this.element.classList.remove("hide")
        this.element.classList.add("show")
    }

    hide() {
        this.element.classList.remove("show")
        this.element.classList.add("hide")
    }

    async addText(text: string) {
        this.isTyping = true;
        this.textContent = "";
        
        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) {
                this.textContent = text;
                break;
            }
            
            this.textContent += text[i];
            this.element.innerHTML = this.textContent + `<img id="textbox-arrow" src="./UI Images/NextDialouge.png" style="display: none;">`;
            await new Promise(resolve => setTimeout(resolve, this.typingSpeed));
        }

        // Show arrow when done
        this.element.innerHTML = this.textContent + `<img id="textbox-arrow" src="./UI Images/NextDialouge.png">`;
        this.isTyping = false;
    }

    skipTyping() {
        this.isTyping = false;
    }

    clear() {
        this.textContent = "";
        this.element.innerHTML = `<img id="textbox-arrow" src="./UI Images/NextDialouge.png">`
    }
}

export const gameTextBox = new Textbox()