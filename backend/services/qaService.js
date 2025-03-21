// import { ChatOpenAI } from "@langchain/openai";
// import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { loadQAStuffChain } from "langchain/chains";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

dotenv.config();

async function processTextAndAnswerQuestion(text, question) {
    try {
      // Ensure the API key is available
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GOOGLE_API_KEY is not set in the environment variables.");
      }
  
      // Initialize embeddings
      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "embedding-001", // Google's embedding model
      });
  
      // Split text into chunks more intelligently
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
  
      const docs = await textSplitter.createDocuments([text]);
  
      // Initialize FAISSStore from documents (in-memory, not saved)
      const faiss = await FaissStore.fromDocuments(docs, embeddings);
  
      // Initialize Gemini model
      const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "gemini-2.0-flash",
        maxOutputTokens: 2048,
        temperature: 0.2,
        systemMessage: "You are a helpful and patient teacher. Your goal is to explain concepts clearly, provide examples, and answer questions in a way that promotes understanding. Use a friendly and encouraging tone."
      });
  
      // Load QA chain
      const qaChain = loadQAStuffChain(model);
  
      // Perform similarity search
      const relevantDocs = await faiss.similaritySearch(question, 5);
  
      // Answer the question
      const result = await qaChain.invoke({
        input_documents: relevantDocs,
        question: question,
      });
      console.log(result)
      return result.text;
    } catch (error) {
      console.error("Error in processTextAndAnswerQuestion:", error);
      throw error; // Propagate the error to the caller
    }
  }

export default processTextAndAnswerQuestion;


































































































// async function storeInVectorDB(text) {
//     // Ensure the API key is available
//     if (!process.env.OPENAI_API_KEY) {
//         throw new Error("OPENAI_API_KEY is not set in the environment variables.");
//     }

//     // Initialize embeddings
//     const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });

//     // Split text into chunks
//     const textChunks = text.split(/\s*\n\s*/);

//     // Initialize FAISSStore from text chunks
//     const faiss = await FaissStore.fromTexts(textChunks, {}, embeddings); // Pass embeddings as the third argument
//     return faiss;
// }

// async function answerQuestion(text, question) {
//     // Create vector DB
//     const faiss = await storeInVectorDB(text);

//     // Initialize ChatOpenAI model
//     const model = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY },{ maxConcurrency: 5 });

//     // Load QA chain
//     const qaChain = loadQAStuffChain(model);

//     // Perform similarity search
//     const relevantDocs = await faiss.similaritySearch(question, 5);

//     // Answer the question
//     const result = await qaChain.call({
//         input_documents: relevantDocs,
//         question: question,
//     });

//     return result;
// }

// export default answerQuestion;



