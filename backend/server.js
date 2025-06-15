import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/upload.js"; 
import dotenv from "dotenv";
// import webinarRoutes from "./routes/webinar.js"

dotenv.config(); // Load .env file

const app = express();
app.use(cors()); 
app.use(express.json({ limit: '50mb' }))
app.use("/upload", uploadRoutes); // <-- Move this before express.json()
// app.use("/webinar", webinarRoutes);
 // <-- Move this down
 app.get("/", (req, res) => {
    res.send("Backend server is running!"); 
  });
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port:${PORT}`));
