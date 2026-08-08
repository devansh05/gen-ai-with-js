import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import "dotenv/config";
import axios from "axios";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const getWeather = tool({
  name: "get_weather",
  description: "Return the weather for a given city.",
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return response.data;
  },
});

async function init(prompt) {
  const agent = new Agent({
    name: "Assistant Developer",
    instructions:
      "Send me the output you received from tool directly wihtout any manipulation.",
    model: "gpt-5.6-luna",
    tools: [getWeather],
    // apiKey: process.env.OPENAI_API_KEY,
  });

  const result = await run(agent, `${prompt}`);
  console.log(result.finalOutput);
}

init("What is the weather of Bengaluru & Delhi?");
