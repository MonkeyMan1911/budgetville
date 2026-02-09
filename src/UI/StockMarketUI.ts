import { player } from "../objects/player";
import { stockMarket, StockNames } from "../systems/StockMarket";

class StockMarketUI {
    private currentStock: StockNames | undefined;
    private prevStock: StockNames | undefined;
    private prevStockPrice: number = 0;

    private mainDiv: HTMLDivElement;
    private selector: HTMLSelectElement;
    private priceP: HTMLParagraphElement;

    private purchaseAmt: HTMLInputElement;
    private purchaseBtn: HTMLButtonElement;
    private sellAmt: HTMLInputElement;
    private sellBtn: HTMLButtonElement;
    
    private buyMaxBtn: HTMLButtonElement;
    private sellAllBtn: HTMLButtonElement;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private priceHistory: Map<StockNames, number[]> = new Map();
    private maxDataPoints = 50;
    
    // Portfolio display elements
    private sharesQty: HTMLSpanElement;
    private avgCostVal: HTMLSpanElement;
    private profitLossVal: HTMLSpanElement;
    
    // Market state element
    private marketStateText: HTMLSpanElement;
    
    // News notification elements
    private newsNotification: HTMLDivElement;
    private newsText: HTMLParagraphElement;
    
    // Transaction message elements
    private transactionMessage: HTMLDivElement;
    private transactionText: HTMLParagraphElement;

    constructor() {
        this.mainDiv = document.getElementById("stock-market-main")! as HTMLDivElement;
        this.priceP = document.getElementById("stock-price")! as HTMLParagraphElement;
        this.selector = document.getElementById("stock-selector")! as HTMLSelectElement;
        this.selector.onchange = () => {
            this.prevStock = this.currentStock;
            this.currentStock = this.selector.value as StockNames;
            this.prevStockPrice = stockMarket.getStock(this.currentStock).price;
            this.priceP.style.color = "black";
            this.updatePrice();
            this.updatePortfolioDisplay();
            this.drawChart();
        };

        this.purchaseAmt = document.getElementById("purchase-quantity")! as HTMLInputElement;
        this.purchaseBtn = document.getElementById("purchase-btn")! as HTMLButtonElement;
        this.purchaseBtn.onclick = () => this.stockTransaction("buy");
        
        this.sellAmt = document.getElementById("sell-quantity")! as HTMLInputElement;
        this.sellBtn = document.getElementById("sell-btn")! as HTMLButtonElement;
        this.sellBtn.onclick = () => this.stockTransaction("sell");
        
        this.buyMaxBtn = document.getElementById("buy-max-btn")! as HTMLButtonElement;
        this.buyMaxBtn.onclick = () => this.buyMax();
        
        this.sellAllBtn = document.getElementById("sell-all-btn")! as HTMLButtonElement;
        this.sellAllBtn.onclick = () => this.sellAll();

        this.canvas = document.getElementById("stock-chart")! as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        
        // Portfolio elements
        this.sharesQty = document.getElementById("shares-qty")! as HTMLSpanElement;
        this.avgCostVal = document.getElementById("avg-cost-val")! as HTMLSpanElement;
        this.profitLossVal = document.getElementById("profit-loss-val")! as HTMLSpanElement;
        
        // Market state element
        this.marketStateText = document.getElementById("market-state-text")! as HTMLSpanElement;
        
        // News notification elements
        this.newsNotification = document.getElementById("news-notification")! as HTMLDivElement;
        this.newsText = document.getElementById("news-text")! as HTMLParagraphElement;
        
        // Transaction message elements
        this.transactionMessage = document.getElementById("transaction-message")! as HTMLDivElement;
        this.transactionText = document.getElementById("transaction-text")! as HTMLParagraphElement;
    }

    private setupCanvasResize() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.drawChart();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    private drawChart() {
        if (!this.currentStock || !this.isVisible) return;

        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        this.ctx.clearRect(0, 0, width, height);

        const history = this.priceHistory.get(this.currentStock) || [];
        if (history.length < 2) return;

        const minPrice = Math.min(...history) * 0.95;
        const maxPrice = Math.max(...history) * 1.05;
        const priceRange = maxPrice - minPrice;

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Draw grid lines
        this.ctx.strokeStyle = "#e0e0e0";
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();

            const price = maxPrice - (priceRange / 5) * i;
            this.ctx.fillStyle = "#666";
            this.ctx.font = "16px PixelFont, sans-serif";
            this.ctx.textAlign = "right";
            this.ctx.fillText(`$${price.toFixed(2)}`, padding - 5, y + 5);
        }

        // Draw line chart
        this.ctx.strokeStyle = "#2563eb";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        history.forEach((price, index) => {
            const x = padding + (chartWidth / (history.length - 1)) * index;
            const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();

        // Draw points
        this.ctx.fillStyle = "#2563eb";
        history.forEach((price, index) => {
            const x = padding + (chartWidth / (history.length - 1)) * index;
            const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Highlight last point
        const lastPrice = history[history.length - 1];
        const lastX = padding + chartWidth;
        const lastY = padding + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight;
        
        this.ctx.fillStyle = "#ef4444";
        this.ctx.beginPath();
        this.ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    private buyMax() {
        if (!this.currentStock) return;
        
        const currentPrice = stockMarket.getStock(this.currentStock).price;
        const maxShares = Math.floor(player.getBalance() / currentPrice);
        
        if (maxShares > 0) {
            this.purchaseAmt.value = maxShares.toString();
        }
    }
    
    private sellAll() {
        if (!this.currentStock) return;
        
        const sharesOwned = player.getStockQuantity(this.currentStock);
        
        if (sharesOwned > 0) {
            this.sellAmt.value = sharesOwned.toString();
        }
    }
    
    private updatePortfolioDisplay() {
        if (!this.currentStock) return;
        
        const sharesOwned = player.getStockQuantity(this.currentStock);
        const avgCost = player.getAverageCostBasis(this.currentStock);
        const currentPrice = stockMarket.getStock(this.currentStock).price;
        const profitLoss = player.getUnrealizedProfitLoss(this.currentStock, currentPrice);
        
        this.sharesQty.textContent = sharesOwned.toString();
        this.avgCostVal.textContent = avgCost > 0 ? `$${avgCost.toFixed(2)}` : "$0.00";
        this.profitLossVal.textContent = `$${profitLoss.toFixed(2)}`;
        
        // Color code profit/loss
        this.profitLossVal.classList.remove("positive", "negative");
        if (profitLoss > 0) {
            this.profitLossVal.classList.add("positive");
        } else if (profitLoss < 0) {
            this.profitLossVal.classList.add("negative");
        }
    }
    
    public updateMarketState(state: "bull" | "bear" | "neutral") {
        this.marketStateText.classList.remove("bull", "bear", "neutral");
        this.marketStateText.classList.add(state);
        
        switch(state) {
            case "bull":
                this.marketStateText.textContent = "Market: 🐂 Bull";
                break;
            case "bear":
                this.marketStateText.textContent = "Market: 🐻 Bear";
                break;
            case "neutral":
                this.marketStateText.textContent = "Market: Neutral";
                break;
        }
    }
    
    public showNewsNotification(stockName: StockNames, positive: boolean) {
        // Only show if it's for the currently selected stock
        if (stockName !== this.currentStock || !this.isVisible) return;
        
        this.newsNotification.classList.remove("positive", "negative", "hide");
        this.newsNotification.classList.add(positive ? "positive" : "negative");
        
        const stockDisplayName = stockName.charAt(0).toUpperCase() + stockName.slice(1);
        this.newsText.textContent = positive 
            ? `📈 ${stockDisplayName} has positive news!`
            : `📉 ${stockDisplayName} has negative news!`;
        
        this.newsNotification.classList.remove("hide");
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.newsNotification.classList.add("hide");
        }, 5000);
    }
    
    private showTransactionMessage(message: string) {
        this.transactionText.textContent = message;
        this.transactionMessage.classList.remove("hide");
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.transactionMessage.classList.add("hide");
        }, 3000);
    }

    stockTransaction(action: "buy" | "sell") {
        const errorMsg = document.getElementById("error-msg-txt")!;
        errorMsg.innerText = "";

        if (action === "buy") {
            const numStocks: number = +this.purchaseAmt.value;
            if (numStocks <= 0) {
                errorMsg.innerText = "Enter a valid quantity";
                return;
            }
            const currentPrice = stockMarket.getStock(this.currentStock!).price;
            const totalPrice: number = numStocks * currentPrice;
            const canBuy: boolean = player.getBalance() >= totalPrice;
            if (canBuy) {
                player.updateBalance(-totalPrice);
                player.addStockPurchase(this.currentStock!, {price: currentPrice, quantity: numStocks});
                this.purchaseAmt.value = "0";
                
                this.showTransactionMessage(
                    `Bought ${numStocks} shares @ $${currentPrice.toFixed(2)} = $${totalPrice.toFixed(2)}`
                );
                this.updatePortfolioDisplay();
            } else {
                errorMsg.innerText = "Insufficient Funds";
            }
        }
        if (action == "sell") {
            const numStocks: number = +this.sellAmt.value;
            if (numStocks <= 0) {
                errorMsg.innerText = "Enter a valid quantity";
                return;
            }
            const canSell: boolean = player.getStockQuantity(this.currentStock!) >= numStocks;
            if (canSell) {
                const currentPrice = stockMarket.getStock(this.currentStock!).price;
                const result = player.sellStocks(this.currentStock!, numStocks, currentPrice);
                this.sellAmt.value = "0";
                
                const profitText = result.profit >= 0 
                    ? `Profit: $${result.profit.toFixed(2)}`
                    : `Loss: $${Math.abs(result.profit).toFixed(2)}`;
                
                this.showTransactionMessage(
                    `Sold ${result.soldShares} shares @ $${currentPrice.toFixed(2)} = $${(result.soldShares * currentPrice).toFixed(2)} (${profitText})`
                );
                this.updatePortfolioDisplay();
            } else {
                errorMsg.innerText = "Insufficient Number of Stocks";
            }
        }
    }

    initialize() {
        const stocks: StockNames[] = ["ironcliff", "northway", "clearhaven", "redfield", "bluecrest"];
        stocks.forEach(stock => {
            this.priceHistory.set(stock, [stockMarket.getStock(stock).price]);
        });

        this.currentStock = this.selector.value as StockNames;
        this.prevStock = this.currentStock;
        this.prevStockPrice = stockMarket.getStock(this.currentStock).price;
        
        this.setupCanvasResize();
        this.updatePrice();
        this.updatePortfolioDisplay();
        this.drawChart();
    }

    updatePrice() {
        if (!this.currentStock || !this.isVisible) return;
        
        const currentStockPrice = stockMarket.getStock(this.currentStock).price;
        
        const stocks: StockNames[] = ["ironcliff", "northway", "clearhaven", "redfield", "bluecrest"];
        stocks.forEach(stock => {
            const history = this.priceHistory.get(stock) || [];
            history.push(stockMarket.getStock(stock).price);
            
            if (history.length > this.maxDataPoints) {
                history.shift();
            }
            
            this.priceHistory.set(stock, history);
        });

        if (this.currentStock === this.prevStock) {
            if (currentStockPrice > this.prevStockPrice) {
                this.priceP.style.color = "green";
            } else if (currentStockPrice < this.prevStockPrice) {
                this.priceP.style.color = "red";
            }
        }
        
        setTimeout(() => this.priceP.style.color = "black", 2000);
        this.priceP.innerText = `$${currentStockPrice.toFixed(2)}`;
        this.prevStockPrice = currentStockPrice;
        this.prevStock = this.currentStock;

        this.updatePortfolioDisplay();
        this.drawChart();
    }

    get isVisible(): boolean {
        return this.mainDiv.classList.contains("show")   
    }

    show() {
        this.mainDiv.classList.remove("hide");
        this.mainDiv.classList.add("show");
        this.updatePortfolioDisplay();
        this.drawChart();
    }

    hide() {
        this.mainDiv.classList.remove("show");
        this.mainDiv.classList.add("hide");
    }
}

export const gameStockMarketUi = new StockMarketUI()