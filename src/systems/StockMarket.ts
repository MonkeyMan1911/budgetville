// All company names are fictional and used for simulation purposes only
type StockNames = "ironcliff" | "northway" | "clearhaven" | "redfield" | "bluecrest"
type StockTickers = "icg" | "nws" | "chc" | "rfi" | "bch"
interface StockObj {
  name: StockNames
  ticker: StockTickers
  price: number
  basePrice: number // Track original price for recovery
}

type MarketState = "bull" | "bear" | "neutral"

interface NewsEvent {
  impact: number
  volatilityBoost: number
  ticksRemaining: number
  recoveryTicks: number // Ticks to gradually recover after news ends
}


class StockMarket {
    private stockData: Record<StockNames, StockObj> = {
        ironcliff:  { name: "ironcliff",  ticker: "icg", price: 42, basePrice: 42 },
        northway:   { name: "northway",   ticker: "nws", price: 18, basePrice: 18 },
        clearhaven: { name: "clearhaven", ticker: "chc", price: 31, basePrice: 31 },
        redfield:   { name: "redfield",   ticker: "rfi", price: 55, basePrice: 55 },
        bluecrest:  { name: "bluecrest",  ticker: "bch", price: 24, basePrice: 24 },
    }

    private marketState: MarketState = "neutral"
    private marketTicksRemaining = 0

    private newsEvents: Partial<Record<StockNames, NewsEvent>> = {}
    private recoveryPhase: Partial<Record<StockNames, { ticksRemaining: number }>> = {}
    
    private intervalId: number | null = null

    start(): void {
        if (this.intervalId === null) {
            this.intervalId = window.setInterval(() => {
                this.updatePrices()
            }, 5000) // Update every 5 seconds
        }
    }

    stop(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    updatePrices() {
        this.maybeChangeMarket()

        const market = this.getMarketModifiers()

        Object.keys(this.stockData).forEach(stockName => {
            const name = stockName as StockNames
            const stock = this.stockData[name]

            this.maybeTriggerNews(name)

            let trend = market.trend
            let volatility = market.volatility

            const news = this.newsEvents[name]
            if (news) {
                trend += news.impact
                volatility += news.volatilityBoost
                news.ticksRemaining--

                if (news.ticksRemaining <= 0) {
                    // Start recovery phase
                    this.recoveryPhase[name] = { ticksRemaining: news.recoveryTicks }
                    delete this.newsEvents[name]
                }
            }

            // Handle recovery back to base price
            const recovery = this.recoveryPhase[name]
            if (recovery) {
                const diff = stock.basePrice - stock.price
                trend += diff * 0.15 // Gradual pull back to base price
                recovery.ticksRemaining--

                if (recovery.ticksRemaining <= 0) {
                    delete this.recoveryPhase[name]
                }
            }

            stock.price = this.fluctuate(stock.price, volatility, trend)
        })

        console.log(`Market: ${this.marketState}`, this.stockData)
    }


    private fluctuate(price: number, volatility = 0.02, trend = 0): number {
        const randomChange = (Math.random() * 2 - 1) * volatility
        const newPrice = price * (1 + randomChange + trend)

        return Math.max(1, Math.round(newPrice * 100) / 100)
    }

    private getMarketModifiers() {
        switch (this.marketState) {
            case "bull":
                return { trend: 0.003, volatility: 0.015 }
            case "bear":
                return { trend: -0.003, volatility: 0.03 }
            default:
                return { trend: 0, volatility: 0.02 }
        }
    }

    private maybeChangeMarket() {
        if (this.marketTicksRemaining > 0) {
            this.marketTicksRemaining--
            return
        }

        const roll = Math.random()

        // Balanced probability: ~3-6% chance per tick
        if (roll < 0.03) {
            this.marketState = "bull"
            this.marketTicksRemaining = 25
        } else if (roll < 0.06) {
            this.marketState = "bear"
            this.marketTicksRemaining = 25
        } else {
            this.marketState = "neutral"
            this.marketTicksRemaining = 20 // Shorter neutral periods
        }
    }

    private maybeTriggerNews(stock: StockNames) {
        if (this.newsEvents[stock]) return
        if (this.recoveryPhase[stock]) return // Don't trigger news during recovery
        if (Math.random() > 0.008) return // Much lower: 0.8% chance per tick

        const positive = Math.random() > 0.5

        this.newsEvents[stock] = {
            impact: positive ? 0.08 : -0.1,
            volatilityBoost: 0.05,
            ticksRemaining: 3,
            recoveryTicks: 8 // 8 ticks to recover back
        }

        console.log(positive ? `📈 Positive news for ${stock}` : `📉 Negative news for ${stock}`)
    }


    getStockPrices() {
        return this.stockData
    }
    
    getStock(name: StockNames) {
        return this.stockData[name]
    }
}

export const stockMarket = new StockMarket()