import { gameStockMarketUi } from "../UI/StockMarketUI"

// All company names are fictional and used for simulation purposes only
export type StockNames = "ironcliff" | "northway" | "clearhaven" | "redfield" | "bluecrest"
type StockTickers = "icg" | "nws" | "chc" | "rfi" | "bch"
interface StockObj {
  name: StockNames
  ticker: StockTickers
  price: number
  basePrice: number
}

type MarketState = "bull" | "bear" | "neutral"

interface NewsEvent {
  impact: number
  volatilityBoost: number
  ticksRemaining: number
  recoveryTicks: number
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
            }, 5000)
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
                    this.recoveryPhase[name] = { ticksRemaining: news.recoveryTicks }
                    delete this.newsEvents[name]
                }
            }

            // Handle recovery back to base price (gentler pull)
            const recovery = this.recoveryPhase[name]
            if (recovery) {
                const diff = stock.basePrice - stock.price
                const percentDiff = diff / stock.basePrice
                
                // Only apply recovery force if significantly off base price
                if (Math.abs(percentDiff) > 0.05) {
                    trend += percentDiff * 0.08 // Gentler recovery
                }
                
                recovery.ticksRemaining--

                if (recovery.ticksRemaining <= 0) {
                    delete this.recoveryPhase[name]
                }
            } else {
                // Natural mean reversion when not in news/recovery
                const diff = stock.basePrice - stock.price
                const percentDiff = diff / stock.basePrice
                
                // Very gentle pull toward base price (prevents runaway prices)
                if (Math.abs(percentDiff) > 0.15) {
                    trend += percentDiff * 0.03
                }
            }

            stock.price = this.fluctuate(stock.price, volatility, trend)
        })

        gameStockMarketUi.updatePrice()
        console.log(`Market: ${this.marketState}`, this.stockData)
    }


    private fluctuate(price: number, volatility = 0.02, trend = 0): number {
        const randomChange = (Math.random() * 2 - 1) * volatility
        const newPrice = price * (1 + randomChange + trend)

        // Price floor: never go below 20% of base price
        const minPrice = price * 0.2
        
        return Math.max(minPrice, Math.round(newPrice * 100) / 100)
    }

    private getMarketModifiers() {
        switch (this.marketState) {
            case "bull":
                return { trend: 0.008, volatility: 0.02 } // Stronger upward trend
            case "bear":
                return { trend: -0.008, volatility: 0.035 } // Stronger downward trend
            default:
                return { trend: 0.001, volatility: 0.025 } // Slight upward bias in neutral
        }
    }

    private maybeChangeMarket() {
        if (this.marketTicksRemaining > 0) {
            this.marketTicksRemaining--
            return
        }

        const roll = Math.random()

        if (roll < 0.03) {
            this.marketState = "bull"
            this.marketTicksRemaining = 25
            console.log("🐂 BULL MARKET STARTED")
        } else if (roll < 0.06) {
            this.marketState = "bear"
            this.marketTicksRemaining = 25
            console.log("🐻 BEAR MARKET STARTED")
        } else {
            this.marketState = "neutral"
            this.marketTicksRemaining = 20
        }
    }

    private maybeTriggerNews(stock: StockNames) {
        if (this.newsEvents[stock]) return
        if (this.recoveryPhase[stock]) return
        if (Math.random() > 0.02) return

        const positive = Math.random() > 0.5

        this.newsEvents[stock] = {
            impact: positive ? 0.015 : -0.018, // More balanced impact
            volatilityBoost: 0.015, // Lower volatility boost
            ticksRemaining: 4, // Longer news duration
            recoveryTicks: 10 // Longer recovery
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