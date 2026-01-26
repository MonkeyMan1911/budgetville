import { stockMarket, StockNames } from "../systems/StockMarket";

class StockMarketUI {
    private currentStock: StockNames | undefined;
    private prevStock: StockNames | undefined;
    private prevStockPrice: number = 0;

    private mainDiv: HTMLElement;
    private selector: HTMLSelectElement;
    private priceP: HTMLParagraphElement;

    constructor() {
        this.mainDiv = document.getElementById("stock-market-main")!
        this.priceP = document.getElementById("stock-price")! as HTMLParagraphElement
        this.selector = document.getElementById("stock-selector")! as HTMLSelectElement
        this.selector.onchange = () => {
            this.prevStock = this.currentStock;
            this.currentStock = this.selector.value as StockNames
            this.prevStockPrice = stockMarket.getStock(this.currentStock).price;
            this.priceP.style.color = "black";
            this.updatePrice()
        }
    }

    initialize() {
        this.currentStock = this.selector.value as StockNames;
        this.prevStock = this.currentStock;
        this.prevStockPrice = stockMarket.getStock(this.currentStock).price;
        this.updatePrice()
    }

    updatePrice() {
        if (!this.currentStock) return;
        
        const currentStockPrice = stockMarket.getStock(this.currentStock).price;
        
        if (this.currentStock === this.prevStock) {
            if (currentStockPrice > this.prevStockPrice) {
                this.priceP.style.color = "green";
            } else if (currentStockPrice < this.prevStockPrice) {
                this.priceP.style.color = "red";
            }
        }
        setTimeout(() => this.priceP.style.color = "black", 2000)
        this.priceP.innerText = `$${currentStockPrice.toFixed(2)}`;
        this.prevStockPrice = currentStockPrice;
        this.prevStock = this.currentStock;
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