class BalanceUI {
    private element: HTMLElement
    private balanceText: HTMLElement
    private balanceImg: HTMLImageElement

    constructor() {
        this.element = document.getElementById("balance-hud")!
        this.balanceImg = document.getElementById("balance-img") as HTMLImageElement
        
        // Create a text element for the balance
        this.balanceText = document.createElement("span")
        this.balanceText.style.position = "absolute"
        this.balanceText.style.right = "-200%"
        this.balanceText.style.top = "50%"
        this.balanceText.style.transform = "translate(-50%, -50%)"
        this.balanceText.style.fontSize = "45px"
        this.balanceText.style.color = "black"
        this.balanceText.style.fontWeight = "bold"
        this.balanceText.style.zIndex = "10"
        this.balanceText.style.fontFamily = `"PixelFont", sans-serif`
        
        this.element.appendChild(this.balanceText)
    }

    updateBalance(balance: number) {
        this.balanceText.textContent = "$" + balance.toFixed(2)
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

export const balanceDiv = new BalanceUI()
