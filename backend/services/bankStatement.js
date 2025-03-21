// 
import { v1 } from "@google-cloud/documentai";
const { DocumentProcessorServiceClient } = v1;
import { GoogleAuth } from "google-auth-library";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables



// const auth = new GoogleAuth({
//     scopes: "https://www.googleapis.com/auth/cloud-platform",
// });

async function extractBankStatementData(fileBuffer) {

    const PROJECT_ID = process.env.GCP_PROJECT_ID;
const PROCESSOR_ID = process.env.GCP_PROCESSOR_ID;
const LOCATION = process.env.GCP_LOCATION || "us";

const documentaiClient = new DocumentProcessorServiceClient();

    // const url = `https://${LOCATION}-documentai.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}:process`;

    // const client = await auth.getClient();
    // const token = await client.getAccessToken();

    const resourceName = documentaiClient.processorPath(PROJECT_ID,LOCATION,PROCESSOR_ID);

    // const response = await axios.post(
    //     url,
    //     {
    //         rawDocument: {
    //             content: fileBuffer.toString("base64"),
    //             mimeType: "application/pdf",
    //         },
    //     },
    //     {
    //         headers: {
    //             Authorization: `Bearer ${token.token}`,
    //             "Content-Type": "application/json",
    //         },
    //     }
    // );


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


    // const document = response.data.document;
    // const { text, entities } = document;

    // Helper function to extract text from text anchors
    function getText(textAnchor,document){
        if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
            return "";
        }
        const startIndex = textAnchor.textSegments[0].startIndex || 0;
        const endIndex = textAnchor.textSegments[0].endIndex ?? text.length; // 🔄 Handle `endIndex` properly
        return document.text.substring(startIndex, endIndex);
    };

    const entities = document.entities || [];

    // Extract key fields
    const extractField = (type) => {
        const field = entities.find((entity) => entity.type === type);
        return field ? getText(field.textAnchor,document) : "Not Found";
    };

    // Extract specific fields
    const bankName = extractField("bank_name");
    const bankAddress = extractField("bank_address");
    const clientName = extractField("client_name");
    const accountNumber = extractField("account_number");
    const accountType = extractField("account_type");
    const statementDate = extractField("statement_date");
    const statementStartDate = extractField("statement_start_date");
    const statementEndDate = extractField("statement_end_date");
    const startingBalance = extractField("starting_balance");
    const endingBalance = extractField("ending_balance");

    // Log general information
    console.log("Extracted Bank Statement Data:");
    console.log(`Bank Name: ${bankName}`);
    console.log(`Bank Address: ${bankAddress}`);
    console.log(`Client Name: ${clientName}`);
    console.log(`Account Number: ${accountNumber}`);
    console.log(`Account Type: ${accountType}`);
    console.log(`Statement Date: ${statementDate}`);
    console.log(`Statement Start Date: ${statementStartDate}`);
    console.log(`Statement End Date: ${statementEndDate}`);
    console.log(`Starting Balance: ${startingBalance}`);
    console.log(`Ending Balance: ${endingBalance}`);

    // Extract transaction details
    console.log("\nTransaction Details:");
    entities.filter((entity) => entity.type.startsWith("table_item/transaction"))
        .forEach((entity) => {
            const transactionType = entity.type.split("/")[1];
            const transactionDetail = getText(entity.textAnchor);
            console.log(`${transactionType}: ${transactionDetail}`);
        });

    return {
        bankName,
        bankAddress,
        clientName,
        accountNumber,
        accountType,
        statementDate,
        statementStartDate,
        statementEndDate,
        startingBalance,
        endingBalance,
    };
}

export default extractBankStatementData;
