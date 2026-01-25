import { StockNames } from "../systems/StockMarket";

class StockMarketUI {
    private currentStock: StockNames | undefined;

    private mainDiv: HTMLElement;

    constructor() {
        this.mainDiv = document.getElementById("stock-market-main")!
    }

    get isVisible(): boolean {
        return this.mainDiv.classList.contains("show")   
    }

    show() {
        this.mainDiv.classList.remove("hide")
        this.mainDiv.classList.add("show")
    }

    hide() {
        this.mainDiv.classList.remove("show")
        this.mainDiv.classList.add("hide")
    }
}

export const gameStockMarketUi = new StockMarketUI()