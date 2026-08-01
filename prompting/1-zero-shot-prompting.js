// ZERO SHOT PROMPTING
// Everthing in one prompt direct directions
// What is 2+3 ?

import OpenAI from "openai";
import "dotenv/config";

console.log(
  `🟡 LOG - process.env.OPENAI_API_KEY: `,
  process.env.OPENAI_API_KEY,
);
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pd = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [
    {
      role: "developer",
      content:
        "You are an senior software engineer and expert in software development.",
    },
    { role: "user", content: "3-4+50*50/3" },
  ],
});

console.log(pd.choices[0].message.content);
