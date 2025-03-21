import express from "express";
import multer from "multer";
import ExcelJS from "exceljs";
import extractText from "../services/bankStatement.js"; // Import Document AI function
import extractInvoiceData from "../services/invoice.js";
import extractData from "../services/documentai.js";
import { textToSpeech } from "../services/textToSpeech.js";
import extractAnswer from "../services/qaService.js"
import analyseText from "../services/analyseText.js"

const router = express.Router();

// Configure multer for file uploads (store files in memory)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const fileBuffer = req.file.buffer;
        const action = req.body.action; // Get the action from the request body
        const question= req.body.question;

        let extractedData;
        let documentType;

        // Process file based on action
        if (action === "action1") {
            extractedData = await extractText(fileBuffer); // Extract from bank statement
            await generateExcel(extractedData, res, action);
        } else if (action === "action2") {
            extractedData = await extractInvoiceData(fileBuffer); // Extract from invoice
            await generateExcel(extractedData, res, action);
        } else if (action === "action3") {
            extractedData = await extractData(fileBuffer);
            documentType= await analyseText(extractedData);
            console.log(documentType);
             await generateAudio(extractedData,documentType,res)
        }else if (action === "action4") {
            extractedData = await extractData(fileBuffer);
            const answer= await extractAnswer(extractedData,question)
            return res.status(200).json({ answer }); }
            else {
            return res.status(400).json({ error: "Invalid action specified" });
        }
    } catch (error) {
        console.error("Error processing document:", error);
        return res.status(500).json({ error: "Failed to process document" });
    }
});

async function generateExcel(extractedData, res, action) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Extracted Data");

        // Add headers with styling
        const headerRow = worksheet.addRow(["Field", "Value"]);
        headerRow.font = { bold: true };
        headerRow.height = 25; // Slightly taller header row
        
        // Apply header styling
        worksheet.getCell('A1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
        };
        worksheet.getCell('B1').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
        };

        // Add extracted data as key-value pairs
        Object.entries(extractedData).forEach(([key, value], index) => {
            const row = worksheet.addRow([key, value]);
            
            // Add alternating row colors for better readability
            if (index % 2 === 1) {
                row.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FAFAFA' }
                    };
                });
            }
        });

        // Set column widths based on content
        // First, find the maximum length of text in each column
        let maxFieldLength = 'Field'.length;
        let maxValueLength = 'Value'.length;

        Object.entries(extractedData).forEach(([key, value]) => {
            maxFieldLength = Math.max(maxFieldLength, String(key).length);
            maxValueLength = Math.max(maxValueLength, String(value).length);
        });

        // Set column widths with some padding (1.2 multiplier for better appearance)
        worksheet.getColumn(1).width = Math.min(50, Math.max(15, maxFieldLength * 1.2));
        worksheet.getColumn(2).width = Math.min(100, Math.max(20, maxValueLength * 1.2));

        // Add borders to all cells
        worksheet.eachRow(row => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                
                // Add proper cell alignment
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: column => column === 1 ? 'left' : 'left',
                    wrapText: true
                };
            });
        });

        // Set response headers for file download
        const fileName = action === "action1" ? "bank_statement.xlsx" : "invoice_data.xlsx";
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

        // Write and send the file as a response
        await workbook.xlsx.write(res);
        res.end();
        
        return true; // Indicate success for promise handling
    } catch (error) {
        console.error("Error generating Excel file:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate Excel file" });
        }
        throw error; // Re-throw to allow error handling in calling functions
    }
}

async function generateAudio(extractedData,documentType, res) 
    {
        try{
       const allAudioContent = await textToSpeech(extractedData, documentType); 
        res.setHeader('Content-Type', 'audio/mpeg');

          res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
       await res.write(allAudioContent);
       res.end();     
    }
    catch (error) {
        console.error("Error generating audio file:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate audio file" });
        }
    }
}

export default router;