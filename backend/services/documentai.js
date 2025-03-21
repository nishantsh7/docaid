import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

import dotenv from "dotenv";

dotenv.config();


async function extractText(fileBuffer) {

    try{

    const PROJECT_ID = process.env.GCP_PROJECT_ID;
    const PROCESSOR_ID = process.env.GCP_OCR_ID;
    const LOCATION = process.env.GCP_LOCATION || "us";

    const documentaiClient = new DocumentProcessorServiceClient();
    const resourceName = documentaiClient.processorPath(PROJECT_ID,LOCATION,PROCESSOR_ID);
 
    
    const rawDocument ={
        content: fileBuffer.toString("base64"),
        mimeType: "application/pdf",
    };

    const request = {
        name: resourceName,
        rawDocument: rawDocument
    };

    const [result] = await documentaiClient.processDocument(request);

    const document = result.document;
    const text = document.text;
    return text;}
    catch (error) {
        console.error('Error extracting text with Document AI:', error);
        throw new Error(`Document AI extraction failed: ${error.message}`);
      }

}

export default extractText;
  
