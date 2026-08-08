import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import { getWeatherData } from '../utilities/utilities.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function initAgent() {
    console.log("Forging your custom software development agent...");

    const customInstructions = `You are an expert software developer.
    When you explain code or concepts, you must use very simple, everyday words.
    Explain things in simple steps so they are easy to remember.
    Never use complex jargon without explaining what it means first.`;

    // The blueprint for your weather function
    const weatherTool = {
        type: 'function',
        name: 'getWeatherData',
        description: 'Gets the current weather and temperature for a specific place.',
        parameters: {
            type: 'OBJECT',
            properties: {
                palce: {
                    type: 'STRING',
                    description: 'The name of the city or place to get the weather for.'
                }
            },
            required: ['palce']
        }
    };

    const agentId = `dev-expert-agent-with-custom-tools-1}`;

    const agent = await ai.agents.create({
        id: agentId,
        base_agent: 'antigravity-preview-05-2026',
        description: 'A software engineer that explains things simply.',
        system_instruction: customInstructions,
        base_environment: 'remote',
        tools: [weatherTool], // We replaced google_search with your custom tool!
    });
    if (!agent.id) {
        throw new Error('Agent creation failed: ID is undefined');
    }
    console.log(agent.id);

}

// initAgent('')

async function getAgents() {
    const agents = await ai.agents.list();

    for (const agent of (agents.agents ?? [])) {
        console.log(agent.id);
    }

}

// getAgents()

// Function to talk to the agent
async function useAgents(agentId, prompt) {
    console.log(`\nSending prompt to agent ${agentId}: "${prompt}"`);
    console.log("Waiting for the agent to think...");

    try {
        const interaction = await ai.interactions.create({
            agent: agentId,
            input: prompt,
            environment: 'remote'
        });

        console.log("\n--- Answer ---");
        console.log(interaction.output_text);

        // Forward-thinking tip: If you want to ask a follow-up question later, 
        // you will need these two pieces of data to continue the session!
        // console.log("Environment ID:", interaction.environment_id);
        // console.log("Interaction ID:", interaction.id);

    } catch (error) {
        console.error("The agent ran into a problem:", error);
    }
}

// 4. The main workflow: Create it, then use it!
async function run() {
    // Create the agent and save its ID
    // const myAgentId = await init();


    // Now use that exact ID to ask your question
    // await useAgents(myAgentId, "What are guardrails in ai?");
    // await useAgents("research-assistant-530e9780", "What are guardrails in ai?");

    useAgents("research-assistant-530e9780", "How will you eliminate software developers and architects, such that I can save myself.")
}

// Start the engine
// run();


async function deleteAgent(agentId) {
    console.log(`\nEvent: Sending termination notice to agent ${agentId}`);
    try {
        // We tell the server to delete the exact resource
        await ai.agents.delete({ name: agentId });
        console.log("Success: The agent has been permanently deleted. The desk is clear.");
    } catch (error) {
        console.error("Could not delete the agent. Here is the problem:", error);
    }
}

// deleteAgent("research-assistant-530e9780")


async function useAgentsWithCustomTools(agentId, prompt) {
    console.log(`\nSending prompt: "${prompt}"`);
    console.log("Waiting for the agent to think...");

    try {
        const interaction = await ai.interactions.create({
            agent: `${agentId}`,
            input: prompt,
            environment: 'remote'
        });

        const functionCallStep = (interaction.steps || []).find(s => s.type === 'function_call');

        if (functionCallStep) {
            console.log(`\nAgent says: "I need to run the [${functionCallStep.name}] tool!"`);

            if (functionCallStep.name === 'getWeatherData') {
                const targetCity = functionCallStep.arguments.palce;
                console.log(`Executing local getWeatherData for: ${targetCity}`);

                const weatherResult = await getWeatherData(targetCity);
                console.log("We got the data from your local file!");

                const resultToSendBack = [{
                    functionResponse: {
                        name: 'getWeatherData',
                        response: { data: weatherResult }
                    }
                }];

                const finalInteraction = await ai.interactions.create({
                    // FIX: Added the 'agents/' prefix here as well!
                    agent: `agents/${agentId}`,
                    input: resultToSendBack,
                    previous_interaction_id: interaction.id
                });

                console.log("\n--- Final Answer ---");
                console.log(finalInteraction.output_text);
            }
        } else {
            console.log("\n--- Agent Answer ---");
            console.log(interaction.output_text);
        }

    } catch (error) {
        console.error("The agent ran into a problem:", error);
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAgentWithCustomTools() {
    const myAgentId = "dev-expert-agent-with-custom-tools-1";

    await sleep(5000);
    // We ask a question that forces the AI to use the tool
    await useAgentsWithCustomTools(myAgentId, "What is the weather like in Bengaluru now?");

    // await deleteAgent(myAgentId);
}

runAgentWithCustomTools();