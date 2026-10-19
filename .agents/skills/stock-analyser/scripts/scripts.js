#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";

export function normalizeStockSymbol(stockSymbol) {
  if (typeof stockSymbol !== "string" || !stockSymbol.trim()) {
    throw new TypeError("stockSymbol must be a non-empty string.");
  }

  return stockSymbol.trim().toUpperCase();
}

export async function analyseStock(
  stockSymbol,
  {
    apiKey = process.env.ALPHA_VANTAGE_API_KEY,
    fetchImpl = globalThis.fetch,
  } = {},
) {
  const symbol = normalizeStockSymbol(stockSymbol);

  if (!apiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY is not configured.");
  }

  if (typeof fetchImpl !== "function") {
    throw new Error("A Fetch API implementation is required.");
  }

  const url = new URL(ALPHA_VANTAGE_URL);
  url.search = new URLSearchParams({
    function: "TIME_SERIES_DAILY",
    symbol,
    outputsize: "compact",
    apikey: apiKey,
  }).toString();

  const response = await fetchImpl(url);

  if (!response.ok) {
    throw new Error(`Alpha Vantage returned HTTP ${response.status}.`);
  }

  const data = await response.json();
  const apiError = data["Error Message"] ?? data.Information ?? data.Note;

  if (apiError) {
    throw new Error(`Alpha Vantage: ${apiError}`);
  }

  const dailySeries = data["Time Series (Daily)"];

  if (!dailySeries || typeof dailySeries !== "object") {
    throw new Error("Alpha Vantage returned no daily price data.");
  }

  const latestDate = Object.keys(dailySeries).sort().at(-1);
  const latest = latestDate ? dailySeries[latestDate] : undefined;

  if (!latest) {
    throw new Error("Alpha Vantage returned an empty daily price series.");
  }

  return {
    symbol,
    date: latestDate,
    open: latest["1. open"],
    high: latest["2. high"],
    low: latest["3. low"],
    close: latest["4. close"],
    volume: latest["5. volume"],
    timezone: data["Meta Data"]?.["5. Time Zone"] ?? null,
    source: "Alpha Vantage TIME_SERIES_DAILY",
  };
}

async function runCli() {
  const stockSymbol = process.argv[2];

  if (!stockSymbol) {
    throw new Error(
      "Usage: node --env-file=.env scripts/scripts.js <stock-symbol>",
    );
  }

  const result = await analyseStock(stockSymbol);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  runCli().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
