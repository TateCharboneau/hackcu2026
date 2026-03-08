import mongoose from "mongoose"

const FlagSchema = new mongoose.Schema({
    phrase: String,
    severity: { type: String, enum: ["low", "medium", "high"] },
    reason: String,
}, { _id: false });

const ParsedTradeSchema = new mongoose.Schema({
    ticker: String,
    assetType: { type: String, enum: ["stock", "option"] },
    strategyType: { type: String, enum: ["long_stock", "short_stock", "long_call", "long_put"] },
    direction: { type: String, enum: ["bullish", "bearish"] },
    capital: Number,
    horizonDays: Number,
    strikePrice: Number,
    currentPrice: Number,
    premiumPerContract: Number,
    contracts: Number,
    confidencePhrases: [String],
    assumptions: [String],
}, { _id: false });

const SimulationSummarySchema = new mongoose.Schema({
    probProfit: Number,
    meanEndingValue: Number,
    medianEndingValue: Number,
    p5: Number,
    p25: Number,
    p75: Number,
    p95: Number,
    maxLoss: Number,
    maxGain: Number,
}, { _id: false });

const SimulationResultSchema = new mongoose.Schema({
    summary: SimulationSummarySchema,
    endingValues: [Number],
    samplePaths: [[Number]],
}, { _id: false });

const PromptsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    rawText: String,
    parsedTrade: ParsedTradeSchema,
    flags: [FlagSchema],
    simulationResult: SimulationResultSchema,
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Prompts || mongoose.model("Prompts", PromptsSchema);

