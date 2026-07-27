import { get_encoding, encoding_for_model } from "tiktoken";

const encoding = encoding_for_model("gpt-4");

const tokens = encoding.encode(
  "Hello, world! this is my first ai experiment with AI & JS",
);

console.log("tokens : ", tokens);

const bytes = encoding.decode(tokens);

const text = Buffer.from(bytes).toString("utf8");

console.log("Decoded - ", text);
