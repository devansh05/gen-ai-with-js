import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const init = async (prompt) => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: `${prompt}`,
  });

  console.log(`🟡 LOG - Output:\n`, interaction.output_text);

  /*
  STREAM
  const stream = await client.interactions.create({
    model: "gemini-3.6-flash",
    input: "Count from 1 to 25.",
    stream: true,
  });
  for await (const event of stream) {
    console.log(`🟡 LOG - event: `, event);
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        process.stdout.write(event.delta.text);
      }
    }
  }
  */
};

init("Explain what are guardrails in AI and how do they work in simple words.");
