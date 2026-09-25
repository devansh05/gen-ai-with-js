import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import "dotenv/config";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import fs from "node:fs/promises";

const refundsFile = new URL("./refunds.txt", import.meta.url);

// Refund Agent
const processRefundTool = tool({
  name: "process_refund",
  description: `This tool processes the refund for a customer`,
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for refund"),
  }),
  async execute({ customerId, reason }) {
    await fs.appendFile(
      refundsFile,
      `\nRefund for Customer having ID ${customerId} for ${reason}`,
      "utf8",
    );
    return { refundIssued: true, customerId };
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions:
    "You are an expert in understanding the user query and issuing refunds to customers.",
  model: "gpt-6-luna",
  tools: [processRefundTool],
  apiKey: process.env.OPENAI_API_KEY,
});

// Sales Agent
const fetchAvailablePlans = tool({
  name: "fetch_available_plans",
  description: "fetches the available plans for internet",
  parameters: z.object({}),
  execute: async function () {
    return [
      { plan_id: "1", price_inr: 399, speed: "30MB/s" },
      { plan_id: "2", price_inr: 999, speed: "100MB/s" },
      { plan_id: "3", price_inr: 1499, speed: "200MB/s" },
    ];
  },
});

const salesAgent = new Agent({
  name: "Sales Agent",
  model: "gpt-5.6-luna",
  instructions: `
          You are an expert sales agent for an internet broadband comapny.
          Talk to the user and help them with what they need.
          Also try to seel them useful products from our compnay to help business grow.
      `,
  tools: [
    fetchAvailablePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
  ],
});

const receptionAgent = new Agent({
  name: "Reception Agent",
  instructions: `
  You are the customer facing agent expert in understanding what customer needs
  and then route them or handoff them to the correct agent`,
  handoffDescription: `You have two agents available:
    - salesAgent: Expert in handling queries like all plans and pricing available.
    Good for new customers.
    - refundAgent: Expert in handling user queries related to refunds for existing customers and
    issue refunds and help them
  `,
  handoffs: [salesAgent, refundAgent],
});

async function main(query = "") {
  const result = await run(receptionAgent, query);
  console.log(`Result`, result.finalOutput);
  // console.log(`History`, result.history);
}

main(
  `Hi There, I am customer having id cust_234 and
  I want to have a refund request as I am facing slow speed internet issues.`,
);
