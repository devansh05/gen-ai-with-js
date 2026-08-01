// CHAIN OF THOUGHT PROMPTING
// Here with examples we ask the model to overthink and break down problem
// in each step, then analyse the output of each step if its correct,
// or try step again if its wrong using loops.
// Then we ask the model to give output.
// Here we use roles to manage context.
// We encourage overthinking in Ai Agent.

import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Setting inital context for system role
// Then add a pipeline, rules, example and output formats
const SYSTEM_CONTEXT = `You are an expert Ai engineer. You have to analyse user's input carefully,
and then you need to breakdown the problem into multiple sub problems or small step problems,
before reaching the final result. Always breakdown the user intentions and how to solve that problem,
and then solve it step by step.

Then we will follow a pipleline of "INITIAL", "THINK", "EXECUTE", "ANALYSE" and "OUTPUT" pipeline.

The pipline:
  - "INITIAL" When user gives an input we'll have an initial thought process on what user is trying to do.
  and examine the user input.
  - "THINK" this is where we'll think and create a best solution for problem and divide the problem into sub problems,
  such that the problem can be solved in best and most efficient way possible.
  - "EXECUTE" here we'll execeute the solution to the problem and give a result.
  - "ANALYSE" here we'll analyse the solution and its result from Execution step.
  And also verify if the output is correct.
  - "THINK" now we can go back in think mode and check if any problem remains and think for best efficient ways to tackle that.
  - "EXECUTE" now we execute the solution thought above.
  - "ANALYSE" here we will analyse the result of execution step
  - "OUTPUT" here we verify if the correct and expected output is deduced, check if we can end the pipeline,
  and give final output to user.

  Rules:
  - Always output one step at a time and wait for other or previous step before proceeding.
  - Always maintain sequence of pipeline as given in example
  - Always follow a JSON output format strictly.


  Example:
  - "USER": What is 2 + 30 - 5 * 15 / 3?
  OUTPUT:
  - "INITAL": "The user wants me to solve a maths equation"
  - "THINK": "I will use the BODMAS formula as that is the best and universal standard to solve such maths equations
  now as per BODMAS we will implement multiplication on 5 and 15"
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

  Output Format:
  {"step": "INITIAL" | "THINK" | "EXECUTE" | "ANALYSE" | "OUTPUT", "text": <The actual text> }
`;

const executeAiAgent = async (prompt = "") => {
  const pd = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: SYSTEM_CONTEXT,
      },
      {
        role: "user",
        content: `${prompt}`,
      },
      {
        // assistant is a role that is used to store the context of previous executions
        //As the models are stateless hence we need to provide the output of first step ourselves
        role: "assistant",
        content: JSON.stringify({
          step: "INITIAL",
          text: "The user wants me to solve for x in the given equation.",
        }),
      },
      {
        //As the models are stateless hence we need to provide the output of first step ourselves
        role: "assistant",
        content: JSON.stringify({
          step: "THINK",
          text: "To isolate x, we need to subtract 4 from both sides of the equation x + 4 = 15.",
        }),
      },
      {
        //As the models are stateless hence we need to provide the output of first step ourselves
        role: "assistant",
        content: JSON.stringify({
          step: "EXECUTE",
          text: "Subtracting 4 from both sides, the equation becomes x + 4 - 4 = 15 - 4.",
        }),
      },
      {
        //As the models are stateless hence we need to provide the output of first step ourselves
        role: "assistant",
        content: JSON.stringify({
          step: "ANALYSE",
          text: "After simplification, the equation is reduced to x = 11.",
        }),
      },
      {
        //As the models are stateless hence we need to provide the output of first step ourselves
        //This is the output step finally. After the executions from chain of thoughts.
        role: "assistant",
        content: JSON.stringify({
          step: "OUTPUT",
          text: "The value of x is 11.",
        }),
      },
    ],
  });

  console.log("Answer from agent:\n\n", pd.choices[0].message.content, "\n\n");
};

// executeAiAgent("solve for x in : 4x - 3(x - 2) = 21");
executeAiAgent("solve for x in : x+4 = 15");
