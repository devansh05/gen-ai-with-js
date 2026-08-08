import OpenAI from "openai";
import "dotenv/config";

// SDK are a wrapper on api calls and we use them to have a better development expirience
// unlike api where we need to open a connection, the send params then wait for the response
// and parse this response
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const init = async (prompt) => {
  /*
    const response = await client.responses.create({
    model: "gpt-5.6-luna",
    input: `${prompt}`,
  });
  console.log(`🟡 LOG - RESPONSE :\n`, response.output_text);
  */
  // STREAM

  const stream = await client.responses.create({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "user",
        content: `${prompt}`,
      },
    ],
    stream: true,
  });

  for await (const event of stream) {
    if (event.event_type === "step.delta") {
      if (event.delta.type === "text") {
        process.stdout.write(event.delta.text);
      }
    }
  }
};

init("What are guardrails in Ai explain in simple words");
