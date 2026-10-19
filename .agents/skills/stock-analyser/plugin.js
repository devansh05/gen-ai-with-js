import { analyseStock } from "./scripts/scripts.js";

export const stockAnalyserPlugin = {
  name: "stock-analyser",
  description:
    "Return the latest available daily OHLCV data for an Indian stock symbol.",
  inputSchema: {
    type: "object",
    properties: {
      stockSymbol: {
        type: "string",
        minLength: 1,
        description:
          "Exchange-qualified Alpha Vantage symbol, for example RELIANCE.BSE",
      },
    },
    required: ["stockSymbol"],
    additionalProperties: false,
  },
  async execute({ stockSymbol }) {
    return analyseStock(stockSymbol);
  },
};

export default stockAnalyserPlugin;
