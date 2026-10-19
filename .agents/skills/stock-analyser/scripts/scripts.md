# Stock analyser script

`scripts.js` calls Alpha Vantage directly. It does not start or depend on an MCP server.

## Input

Pass one exchange-qualified Indian stock symbol, such as `RELIANCE.BSE`. The script trims whitespace and converts the symbol to uppercase. It does not guess an exchange suffix.

Set `ALPHA_VANTAGE_API_KEY` in the environment. When the project `.env` file contains the key, run the script from the project root with Node's `--env-file` option:

```bash
node --env-file=.env .agents/skills/stock-analyser/scripts/scripts.js RELIANCE.BSE
```

## Output

The script requests `TIME_SERIES_DAILY`, selects the newest available trading date, and prints JSON containing:

- `symbol`
- `date`
- `open`
- `high`
- `low`
- `close`
- `volume`
- `timezone`
- `source`

These values describe the latest available daily bar, not a real-time or intraday quote.

## JavaScript use

```js
import { analyseStock } from "./scripts/scripts.js";

const quote = await analyseStock("RELIANCE.BSE");
```

The function throws when the API key is missing, the symbol is invalid, Alpha Vantage reports an error or rate limit, or no daily series is available.
