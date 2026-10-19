import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import "dotenv/config";

const server = new McpServer({ name: "mcp-server", version: "1.0.0" });

server.registerTool(
  "stock-analyser",
  {
    description:
      "A tool to find and return stock price of a stock by symbol in Indian Stock Market",
    inputSchema: z.object({ stockSymbol: z.string() }),
  },
  async ({ stockSymbol }) => {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    return await fetch(url)
      .then((res) => res.json())
      .then((data) => {
        return data
      })
      .catch((error) => {
        return error
      });
  },
);

// add the transport layer to this mcp STDIO
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();


/** 
 * node --input-type=module -e 
 * 'import { Client } from 
 * "@modelcontextprotocol/sdk/client/index.js"; 
 * import { StdioClientTransport } from 
 * "@modelcontextprotocol/sdk/client/stdio.js"; 
 * const client=new 
 * Client({name:"stock-check",version:"1.0.0"}); 
 * const transport=new 
 * StdioClientTransport({
 * command:"node",
 * args:["mcp/mcp.js"],
 * cwd:process.cwd(),
 * stderr:"pipe"}); await client.connect(transport); const result=await client.callTool({name:"stock-analyser",arguments:{stockSymbol:"SBIN.BSE"}}); console.log(JSON.stringify(result)); await client.close();'*/