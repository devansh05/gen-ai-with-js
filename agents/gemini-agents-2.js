import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { getWeatherData } from '../utilities/utilities.js';

// Initialize the AI client. It automatically picks up your GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Event 2: Your Custom Function
function checkInventory(productName) {
  const inventory = { "Laptop": 12, "Mouse": 0, "Keyboard": 45 };
  const stockCount = inventory[productName] || 0;
  return { product: productName, inStock: stockCount > 0, quantity: stockCount };
}

// Event 3: The Menu
const inventoryTool = {
  functionDeclarations: [
    {
      name: "check_inventory",
      description: "Checks the current warehouse stock for a specific product name.",
      parameters: {
        type: "object",
        properties: {
          productName: {
            type: "string",
            description: "The name of the product to look up, like 'Laptop' or 'Mouse'",
          },
        },
        required: ["productName"],
      },
    },
  ],
};

// Event 4: The Handoff
async function runAgent() {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3.6-flash',
      config: { tools: [inventoryTool] }
    });

    console.log("Asking Gemini to check stock...\n");
    let response = await chat.sendMessage({ message: 'I need to know if we have any Laptops in stock right now. What about a Mouse?' });

    // The Agent Loop
    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log("Gemini is pausing to ask YOU for data...");
      
      // Handle multiple function calls if it asks for both Laptop and Mouse at once
      const functionResponses = [];
      
      for (const call of response.functionCalls) {
        if (call.name === "check_inventory") {
          console.log(`-> Running tool for: ${call.args.productName}`);
          const result = checkInventory(call.args.productName);
          
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: result
            }
          });
        }
      }
      
      // Feed the raw data back so Gemini can finish its thought
      console.log("\nFeeding data back to Gemini...");
      response = await chat.sendMessage({ message: functionResponses });
    }

    console.log("\nFinal Answer from Gemini:");
    console.log(response.text);

  } catch (error) {
    console.error("Something broke:", error);
  }
}

runAgent();