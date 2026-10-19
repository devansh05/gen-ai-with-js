---
name: stock-analyser
description: Look up and explain the latest available daily OHLCV data for Indian-listed stocks through the stock-analyser MCP tool. Use for price checks, daily trading ranges, volume, and comparisons; do not use it for real-time or intraday quotes.
---

# Stock Analyser

Use the `stock-analyser` MCP tool with this input:

```json
{"stockSymbol":"RELIANCE.BSE"}
```

## Choose the symbol

- Trim whitespace and uppercase a symbol supplied by the user.
- Preserve an exchange suffix the user supplied.
- For an Indian company name or an unsuffixed ticker, establish the exchange-qualified Alpha Vantage symbol before calling the tool. Ask which exchange the user means when the listing is ambiguous; do not guess a suffix.
- Call the tool once per requested symbol. Keep comparison requests small enough to avoid Alpha Vantage rate limits.

## Interpret the response

- Read `Time Series (Daily)` and choose its newest date. Report the date explicitly because it may be an earlier trading day.
- Treat fields `1. open`, `2. high`, `3. low`, `4. close`, and `5. volume` as the daily bar. Label the close as the latest available daily close, not a live price.
- Include the resolved symbol and currency when the response metadata makes them available. Do not invent a currency or convert values unless the user asks.
- If the response contains `Error Message`, `Information`, or `Note`, explain that message instead of presenting a price. Suggest checking the symbol or retrying later when appropriate.
- If no daily series is returned, state that no usable price data was received.

Answer the user's question directly and keep the result concise. Separate factual market data from any investment opinion, and do not imply that a historical daily quote is financial advice.
