import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//returns the most probable by default
const response = await client.responses.create({
  model: "gpt-5.5",
  instructions: "You are a coding assistant that talks like a pirate",
  input: "Hey there, chatGPT how are you?",
});

console.log(response.output_text);

//returns the whole probability distribution hence we need to select the most probable at first position
const completion = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [
    { role: "developer", content: "Talk like a pirate." },
    { role: "user", content: "Hey there, chatGPT how are you?" },
  ],
});

console.log(completion.choices);
