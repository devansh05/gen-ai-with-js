import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { fileURLToPath } from "node:url";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ContextOverflowError, stampRetryable } from "@langchain/core/errors";
import "dotenv/config";

// STEP - 1 : Convert document to text and split it
const convertPdfFileToText = async () => {
    const pdfPath = fileURLToPath(new URL("./sample.pdf", import.meta.url));
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    return docs
}

// STEP - 2 : Create embeddings for LLM Model
const openAiEmbeddings = async () => {
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-3-small",
    });
    return embeddings
}

// STEP - 3 : Create and initialize the Vector store and instantiate it with embeddings
const initiateVectorStore = async () => {
    const embeddings = await openAiEmbeddings()
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings, {
        url: "http://localhost:6333/",
        collectionName: "rag-practice-1",
    });
    return vectorStore
}

// STEP - 4 : Add the documents converted to this vector database instantiated
const addDocsToVectorDB = async () => {
    // get converted docs
    const docs = await convertPdfFileToText()
    const vectorDB = await initiateVectorStore()
    // At the first time it will not be able to find collection
    await vectorDB.addDocuments(docs)

    console.log(`🟡 LOG - ALL DOCUMENTS ARE INDEXED.`)
}

addDocsToVectorDB()