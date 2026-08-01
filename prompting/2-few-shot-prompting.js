// FEW SHOT PROMPTING
// Direct instructions with examples
// also called Influencer Prompting
// This also helps reducing the number of tokens in output
// What is 2+3 ?
// Example :
//  - What is 5+4?
//  Expected Output : 9 (Nine)

import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pd = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [
    {
      role: "user",
      content: `What is 4*4-6
      Example :
        - What is 5+4?
          Expected Output : 9 (Nine)
      `,
    },
  ],
});

console.log(pd.choices[0].message.content);
