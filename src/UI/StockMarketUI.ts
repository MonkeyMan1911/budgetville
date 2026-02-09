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

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private priceHistory: Map<StockNames, number[]> = new Map();
    private maxDataPoints = 50;

    constructor() {
        this.mainDiv = document.getElementById("stock-market-main")! as HTMLDivElement
        this.priceP = document.getElementById("stock-price")! as HTMLParagraphElement
        this.selector = document.getElementById("stock-selector")! as HTMLSelectElement
        this.selector.onchange = () => {
            this.prevStock = this.currentStock;
            this.currentStock = this.selector.value as StockNames
            this.prevStockPrice = stockMarket.getStock(this.currentStock).price;
            this.priceP.style.color = "black";
            this.updatePrice()
            this.drawChart()
        }

        this.purchaseAmt = document.getElementById("purchase-quantity")! as HTMLInputElement
        this.purchaseBtn = document.getElementById("purchase-btn")! as HTMLButtonElement
        this.purchaseBtn.onclick = () => this.stockTransaction("buy")
        this.sellAmt = document.getElementById("sell-quantity")! as HTMLInputElement
        this.sellBtn = document.getElementById("sell-btn")! as HTMLButtonElement
        this.sellBtn.onclick = () => this.stockTransaction("sell")

        this.canvas = document.getElementById("stock-chart")! as HTMLCanvasElement
        this.ctx = this.canvas.getContext("2d")!

        // Don't initialize price history here - wait for initialize() to be called
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

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        const history = this.priceHistory.get(this.currentStock) || [];
        if (history.length < 2) return;

        // Calculate bounds
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

            // Price labels
            const price = maxPrice - (priceRange / 5) * i;
            this.ctx.fillStyle = "#666";
            this.ctx.font = "16px PixelFont, sans-serif";
            this.ctx.textAlign = "right";
            this.ctx.fillText(`$${price.toFixed(2)}`, padding - 5, y + 4.5);
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

    // Event functions
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
                player.addStockPurchase(this.currentStock!, {price: totalPrice, quantity: numStocks});
                this.purchaseAmt.value = "0";
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
                player.sellStocks(this.currentStock!, numStocks, stockMarket.getStock(this.currentStock!).price);
                this.sellAmt.value = "0";
            } else {
                errorMsg.innerText = "Insufficient Number of Stocks";
            }
        }
    }

    // Class methods
    initialize() {
        // Initialize price history for all stocks now that stockMarket is ready
        const stocks: StockNames[] = ["ironcliff", "northway", "clearhaven", "redfield", "bluecrest"];
        stocks.forEach(stock => {
            this.priceHistory.set(stock, [stockMarket.getStock(stock).price]);
        });

        this.currentStock = this.selector.value as StockNames;
        this.prevStock = this.currentStock;
        this.prevStockPrice = stockMarket.getStock(this.currentStock).price;
        
        this.setupCanvasResize();
        this.updatePrice();
        this.drawChart();
    }

    updatePrice() {
        if (!this.currentStock || !this.isVisible) return;
        
        const currentStockPrice = stockMarket.getStock(this.currentStock).price;
        
        // Update price history for all stocks
        const stocks: StockNames[] = ["ironcliff", "northway", "clearhaven", "redfield", "bluecrest"];
        stocks.forEach(stock => {
            const history = this.priceHistory.get(stock) || [];
            history.push(stockMarket.getStock(stock).price);
            
            // Keep only last maxDataPoints
            if (history.length > this.maxDataPoints) {
                history.shift();
            }
            
            this.priceHistory.set(stock, history);
        });

        // Update price color
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

        // Redraw chart with new data
        this.drawChart();
    }

    get isVisible(): boolean {
        return this.mainDiv.classList.contains("show")   
    }

    show() {
        this.mainDiv.classList.remove("hide");
        this.mainDiv.classList.add("show");
        this.drawChart();
    }

    hide() {
        this.mainDiv.classList.remove("show");
        this.mainDiv.classList.add("hide");
    }
}

export const gameStockMarketUi = new StockMarketUI()