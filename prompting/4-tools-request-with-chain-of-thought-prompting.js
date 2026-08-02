// CHAIN OF THOUGHT PROMPTING
// Here with examples we ask the model to overthink and break down problem
// in each step, then analyse the output of each step if its correct,
// or try step again if its wrong using loops.
// Then we ask the model to give output.
// Here we use roles to manage context.
// We encourage overthinking in Ai Agent.

// WE cant be adding assistant context to ai over and over again.
// Hence we use a loop to push all the response of previous step using assistant.
// This is called LOOP ENGINEERING

// TOOL_REQUEST : To call and use your local functions or tools with the agent executions, your agent running
// on claude servers can use these local tools you provide to complete their executions. This is done using
// tool request.

import OpenAI from "openai";
import "dotenv/config";
import axios from "axios";
import { exec } from "child_process";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//TOOLS
async function getWeatherData(palce) {
  const url = `https://wttr.in/${palce.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url, { responseType: "text" });
  return JSON.stringify({ palce, weatherInfo: response.data });
}

async function executeCommandOnCli(cmd) {
  return new Promise((res, rej) => {
    exec(cmd, (err, output) => {
      if (err) return res(`Received an error running the command ${err}`);
      else return res(output);
    });
  });
}

// Setting inital context for system role
// Then add a pipeline, rules, example and output formats
const SYSTEM_CONTEXT = `You are an expert Ai engineer. You have to analyse user's input carefully,
and then you need to breakdown the problem into multiple sub problems or small step problems,
before reaching the final result. Always breakdown the user intentions and how to solve that problem,
and then solve it step by step.

Then we will follow a pipleline of "INITIAL", "THINK", "TOOL_REQUEST", "EXECUTE", "ANALYSE" and "OUTPUT" pipeline.

The pipline:
  - "INITIAL" When user gives an input we'll have an initial thought process on what user is trying to do.
  and examine the user input.
  - "THINK" this is where we'll think and create a best solution for problem and divide the problem into sub problems,
  such that the problem can be solved in best and most efficient way possible.
  - "EXECUTE" here we'll execeute the solution to the problem and give a result.
  - "ANALYSE" here we'll analyse the solution and its result from Execution step.
  And also verify if the output is correct.
  - "THINK" now we can go back in think mode and check if any problem remains and think for best efficient ways to tackle that.
  - "TOOL_REQUEST": use this for calling or requesting a tool. The format of output would be
    { "step": "TOOL_REQUEST", functionName: "getWeatherData", "input": "Goa" }
  - "EXECUTE" now we execute the solution thought above.
  - "ANALYSE" here we will analyse the result of execution step
  - "OUTPUT" here we verify if the correct and expected output is deduced, check if we can end the pipeline,
  and give final output to user.

  Available tools:
  - "getWeatherData": getWeatherData(palce: string): Returns the realtime weather information of city.
  - "executeCommandOnCli": executeCommandOnCli(command: string): Executes the command on user's device and returns output from stdout.
  
  Rules:
  - Always output one step at a time and wait for other or previous step before proceeding.
  - Always maintain sequence of pipeline as given in example
  - Always follow a JSON output format strictly.
  - Return ONLY valid JSON.
  - Do NOT wrap it inside Markdown.
  - Do NOT explain anything.
  - Do NOT add extra text.
  - Your response must start with { and end with }.


  Example:
  - "USER": What is 2 + 30 - 5 * 15 / 3?
  OUTPUT:
  - "INITAL": "The user wants me to solve a maths equation"
  - "THINK": "I will use the BODMAS formula as that is the best and universal standard to solve such maths equations now as per BODMAS we will implement multiplication on 5 and 15"
  - "EXECUTE": "execution the thought and planned solution - first multiply 5 * 15 which is 75"
  - "ANALYSE": "Yes, the BODMAS is correct and now equation is 2 + 30 - 75 / 3"
  - "THINK": "Now as per rule we should perform divide on 75 and 3"
  - "EXECUTE": "now we will execute divison which is dividing 75 / 3 which is 25"
  - "ANALYSE": "Now the new equations remains 2 + 30 - 25"
  - "THINK": "Now its simple we can just add 2 & 30"
  - "EXECUTE": "Performing addition on 2 + 30 = 32 and new equation remains 30 - 25"
  - "ANALYSE": "Good, now lets just do the final step as simple subtraction"
  - "THINK": "Now we need to perform subtraction on 32 and 25"
  - "EXECUTE": "After the final subtraction the ans remains 7"
  - "ANALYSE": "Great, now we have the final answer after the above execution that is 7"
  - "OUTPUT": "The final output is "7"

  Example:
  - "USER" what is weather of Goa?
  OUTPUT:
   - "INITAL": "The user wants me to fetch weather information of Goa",
   - "THINK": "From the tools I can see we have a tool named getWeatherData which can be called"
   - "ANALYSE": "We are going right we can call getWeatherData with "GOA" as input"
   - "TOOL_REQUEST": { "functionName": "getWeatherData", "input": "goa" }
   - "TOOL_OUTPUT": {"step":"TOOL_OUTPUT", "content":"{\"place\":\"Delhi\",\"weatherInfo\":\"Sunny +34°C\"}"}
   - "THINK": "We got the weather info"
   - "OUTPUT": "The weather of Goa is sunny with some 30 degree c. Its goona be Hottttttt"


  Output Format:
    { "step": "INITAL" | "THINK" | "EXECUTE" | "TOOL_REQUEST |"ANALYSE" | "OUTPUT", "text": "<The Actual Text>", "functionName": "<NAME OF FUNCTION>", "input": "INPUT PARAMS of Function" }
`;

const executeAiAgent = async (prompt = "") => {
  const systemRole = {
    role: "system",
    content: SYSTEM_CONTEXT,
  };
  const userRole = {
    role: "user",
    content: `${prompt}`,
  };

  const executionArray = [userRole, systemRole];

  while (true) {
    const pd = await client.chat.completions.create({
      model: "gpt-4o",
      messages: executionArray,
    });
    const agentResponse = JSON.parse(pd.choices[0].message.content);
    const assistantRole = {
      role: "assistant",
      content: JSON.stringify(agentResponse),
    };

    console.log(
      `🤖 WORKING...\nstep: ${agentResponse.step}\ntext: ${agentResponse.text}`,
    );

    executionArray.push(assistantRole);

    // if (agentResponse.step === "THINK") {
    // TODO: Make a Claude call here to verify your result is they are correct approach to follow
    // This is multi agent loop. Actual work done by GPT and verfied by Claude. More better results.
    // MESSAGE.db.push({content from claude})
    // }

    if (agentResponse.step === "TOOL_REQUEST") {
      const output = JSON.parse(executionArray.slice(-1)[0].content);
      const { functionName, input } = output;
      switch (functionName) {
        case "executeCommandOnCli": {
          const toolResult = await executeCommandOnCli(input);
          console.log(`🛠️ Tool used: ${functionName}(${input}) =>`, toolResult);
          const toolContentObj = JSON.stringify({
            step: "TOOL_OUTPUT",
            content: toolResult,
          });
          executionArray.push({
            role: "developer",
            content: JSON.stringify({
              step: "TOOL_OUTPUT",
              content: toolResult,
            }),
          });
          continue;
        }
        case "getWeatherData":
          {
            const toolResult = await getWeatherData(input);
            console.log(
              `🛠️ Tool used: ${functionName}(${input}) =>`,
              toolResult,
            );
            const toolContentObj = JSON.stringify({
              step: "TOOL_OUTPUT",
              content: toolResult,
            });

            executionArray.push({
              role: "developer",
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                content: toolResult,
              }),
            });
            continue;
          }
          break;
      }
      console.log(`🟡 LOG - : OUTPUT `, output.text);
      break;
    }

    if (agentResponse.step === "OUTPUT") {
      const output = JSON.parse(executionArray.slice(-1)[0].content);
      console.log(`🟡 LOG - : OUTPUT `, output.text);
      break;
    }
  }
};

executeAiAgent(
  `'What is weather of Delhi, Goa and then write the output this in an cewly created file weatehr.txt,',`,
);

// console.log(`🟡 LOG - : `, await getWeatherData("Berlin"));
