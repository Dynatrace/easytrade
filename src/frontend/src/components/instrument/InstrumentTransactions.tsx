import React, { useState } from "react"
import QuickBuyForm from "./forms/QuickBuyForm"
import QuickSellForm from "./forms/QuickSellForm"
import BuyForm from "./forms/BuyForm"
import SellForm from "./forms/SellForm"

type TabId = "quick-buy" | "quick-sell" | "buy" | "sell"

export default function InstrumentTransactions() {
    const [activeTab, setActiveTab] = useState<TabId>("quick-buy")

    return (
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <div className="card" style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 120 }}>
                <button
                    id="quickBuyTab"
                    type="button"
                    className={"tab-btn" + (activeTab === "quick-buy" ? " active" : "")}
                    onClick={() => setActiveTab("quick-buy")}
                >
                    Quick Buy
                </button>
                <button
                    id="quickSellTab"
                    type="button"
                    className={"tab-btn" + (activeTab === "quick-sell" ? " active" : "")}
                    onClick={() => setActiveTab("quick-sell")}
                >
                    Quick Sell
                </button>
                <button
                    id="buyTab"
                    type="button"
                    className={"tab-btn" + (activeTab === "buy" ? " active" : "")}
                    onClick={() => setActiveTab("buy")}
                >
                    Buy
                </button>
                <button
                    id="sellTab"
                    type="button"
                    className={"tab-btn" + (activeTab === "sell" ? " active" : "")}
                    onClick={() => setActiveTab("sell")}
                >
                    Sell
                </button>
            </div>
            <div className="card" style={{ flex: 1, padding: "1rem" }}>
                {activeTab === "quick-buy" && <QuickBuyForm />}
                {activeTab === "quick-sell" && <QuickSellForm />}
                {activeTab === "buy" && <BuyForm />}
                {activeTab === "sell" && <SellForm />}
            </div>
        </div>
    )
}
