import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import "dotenv/config";
import { getWeatherData } from "../utilities/utilities.js";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const getWeatherTool = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return await getWeatherData(city);
  },
});

async function init(prompt) {
  const agent = new Agent({
    name: "Assistant Developer",
    instructions:
      "Send me the output you received from tool directly wihtout any manipulation.",
    model: "gpt-5.6-luna",
    tools: [getWeatherTool],
    // apiKey: process.env.OPENAI_API_KEY,
  });

  const result = await run(agent, `${prompt}`);
  console.log(result.finalOutput);
}

init("What is the weather of Bengaluru & Delhi?");
