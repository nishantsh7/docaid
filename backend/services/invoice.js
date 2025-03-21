import { v1 } from "@google-cloud/documentai";
const { DocumentProcessorServiceClient } = v1;
import { GoogleAuth } from "google-auth-library";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// const auth = new GoogleAuth({
//     scopes: "https://www.googleapis.com/auth/cloud-platform",
// });

async function extractInvoiceData(fileBuffer) {

    const documentaiClient = new DocumentProcessorServiceClient();

    const PROJECT_ID = process.env.GCP_PROJECT_ID;
const PROCESSOR_ID = process.env.GCP_INVOICE_ID;
const LOCATION = process.env.GCP_LOCATION || "us";

const resourceName = documentaiClient.processorPath(PROJECT_ID,LOCATION,PROCESSOR_ID);

    // const url = `https://${LOCATION}-documentai.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}:process`;

    // const client = await auth.getClient();
    // const token = await client.getAccessToken();

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


    // Check if `document` exists in the response
    // const document = response.data?.document ?? {};
    // const text = document.text ?? "";
    // const entities = document.entities ?? [];

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
    const invoiceData = {
        supplierName: extractField("supplier_name"),
        supplierAddress: extractField("supplier_address"),
        receiverName: extractField("receiver_name"),
        receiverAddress: extractField("receiver_address"),
        supplierPhone: extractField("supplier_phone"),
        invoiceId: extractField("invoice_id"),
        invoiceDate: extractField("invoice_date"),
        paymentTerms: extractField("payment_terms"),
        totalAmount: extractField("total_amount"),
        lineItems: [],
    };

    // Extract Line Items
    invoiceData.lineItems = entities
        .filter((entity) => entity.type.startsWith("line_item/")) // Filter only line item details
        .map((entity) => ({
            type: entity.type.split("/")[1], // Extract specific item type (description, quantity, etc.)
            value: getText(entity.textAnchor), // Get the text value
        }));

    return invoiceData;
}

export default extractInvoiceData;
