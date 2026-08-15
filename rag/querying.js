import OpenAI from "openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ContextOverflowError, stampRetryable } from "@langchain/core/errors";
import "dotenv/config";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// STEP - 1 : Initiate the embeddings for the model with same name and api key
const initiateVectorEmbeddingModel = async () => {
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-small",
    });
    return embeddings;
}

// STEP - 2 : Initialize the vector store with that same vectorDB
const initiateVectorStore = async () => {
    const embeddings = await initiateVectorEmbeddingModel()
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings, {
        url: "http://localhost:6333/",
        collectionName: "rag-practice-1",
    });
    return vectorStore
}


// STEP - 3 : Now we will use this vector store as reteriver instead of saving data from db
const retriveDataFromVectorStore = async (userQuery) => {
    const vectorStore = await initiateVectorStore();
    const results = await vectorStore.similaritySearch(userQuery, 5);

    const SYSTEM_PROMT = `You are an expert in answering user queries,
    for the provided context and documents only. Donot answer anything beyond what is not provided
    in User Documents. Answer user in short with page number of that context awith the name of document.
    
    User Documents = ${results.map((result) => JSON.stringify(
        {
            pageContent: result.pageContent,
            pageNumber: result.metadata.loc.pageNumber,
            docName: result.metadata.source
        })
    )
        }`

    return { results, SYSTEM_PROMT }
}

// STEP - 4 : Now we will setup an openAi agent that checks all the results
// and returns users the expected output like a chat
const manipulateDataForUserResponse = async (userQuery) => {

    const { results, SYSTEM_PROMT } = await retriveDataFromVectorStore(userQuery)

    const clientResponse = await client.responses.create({
        model: "gpt-5.6-luna",
        input: [
            {
                role: "system",
                content: `${SYSTEM_PROMT}`,
            },
            {
                role: "user",
                content: `${userQuery}`,
            },
        ],
    });

    console.log(`🟡 LOG - clientResponse from Open Ai: `, clientResponse.output_text)
    return clientResponse.output_text
}

manipulateDataForUserResponse("What animals are referred to or indicated in the documents?")
