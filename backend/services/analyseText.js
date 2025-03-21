import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";



dotenv.config();

async function analyzeDocumentAndSuggestVoice(text) {
  const apiKey = process.env.GEMINI_API_KEY; // Replace with your actual API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const prompt = `Analyze the following document and determine its type (Formal, Academic, Creative, Informational, Personal, Financial, Technical, Instructions). Please provide a one word response only. Document: ${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    // Attempt to parse the JSON response.
    console.log(textResponse);
    return textResponse;
    
  } catch (error) {
    console.error("Error analyzing document:", error);
    return { error: error.message };
  }
}
export default analyzeDocumentAndSuggestVoice;

// async function runExample() {
//   const documentText =
//     "Dear Mr. Smith, We are pleased to inform you that your application for the position of Senior Software Engineer has been approved. Your start date is January 15, 2024. Please contact us at your earliest convenience to discuss the details of your employment.";

//   const analysisResult = await analyzeDocumentAndSuggestVoice(documentText);

//   if (analysisResult && !analysisResult.error) {
//     console.log("Document Analysis:", analysisResult);
//     console.log("Document Type:", analysisResult.documentType);
//     console.log("Voice Modulation:", analysisResult.voiceModulation);
//   } else {
//     console.log("Document analysis failed:", analysisResult);
//   }
// }

// runExample();