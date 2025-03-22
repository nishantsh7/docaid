import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Textarea,
  VStack,
  HStack,
} from "@chakra-ui/react";
import axios from "axios";
import Ask from "./components/Ask"; // Assuming Ask component is imported
import Speak from "./components/Speak"; // Assuming Speak component is imported
import { Toaster, toaster } from "./components/ui/toaster"

export default function DocumentAIApp() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null); // Track which button is loading
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [speaker, setSpeaker] = useState("");

  const backendUrl = "https://backend-service-964145945663.asia-south2.run.app/";

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event, action) => {
    event.stopPropagation(); // Prevent event bubbling
    event.preventDefault(); // Stop form submission behavior

    if (!file) {
      console.error("No file selected");
      return;
    }

    setLoading(true);
    setLoadingType(action); // Track which button is loading

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", action); // Pass action in formData
      const response = await axios.post(
        `${backendUrl}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", action === "action1" ? "bank_statement.xlsx" : "invoice_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching file:", error);
      console.error("Response:", error.response?.data);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleWeb = async (e) => {
    e.preventDefault();
    const webinarData = { title, description, speaker, date, time };

    try {
      const response = await axios.post(
        "http://localhost:5000/webinar/create",
        webinarData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Webinar created successfully!");

    } catch (error) {
      console.error("Error creating webinar:", error);
      alert("Failed to create webinar");
    }
  };

  return (
    <Box h="100vh" bg="black" color="white" overflow="hidden">
      <Toaster />
      
      {/* Navbar */}
      <Box as="nav" bg="gray.900" py={4} px={8} display="flex" alignItems="center">
        <Heading as="h1" fontSize="4xl" fontFamily="logo">
          Doc.aiD
        </Heading>
      </Box>

      {/* Main Content */}
      <Flex direction="column" justify="start" align="center" h="calc(100vh - 80px)" p={6}>
        {/* Horizontal Input and Buttons Section */}
        <Box
          w="full"
          maxW="4xl"
          bgGradient="linear(to-r, gray.500, gray.700)"
          p={6}
          borderRadius="lg"
          boxShadow="xl"
        >
          <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4} fontFamily="logo" textAlign="center">
            Upload Your File
          </Heading>

          {/* Horizontal layout for file input and buttons */}
          <Flex direction={{ base: "column", md: "row" }} gap={4} align="center">
            {/* File Input */}
            <Box flex="1">
              <Input
                size="md"
                color="white"
                bg="transparent"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                type="file"
                accept=".pdf"
                onChange={(event) => {
                  handleFileChange(event);
                  const promise = new Promise((resolve) => setTimeout(resolve, 1000));
                  toaster.promise(promise, {
                    success: { title: "File uploaded!", description: "Looks great" },
                    error: { title: "Upload failed", description: "Try again" },
                    loading: { title: "Uploading...", description: "Please wait" },
                  });
                }}
              />
            </Box>

            {/* Action Buttons in horizontal layout */}
            <Flex gap={3} flex="2" justify="space-between" wrap="wrap">
              <Button
                flex="1"
                minW="150px"
                color="black"
                bg="white"
                py={3}
                borderRadius="md"
                fontWeight="bold"
                transition="background 0.2s ease-in-out"
                _hover={{ bg: "gray.300" }}
                disabled={loading}
                onClick={async (event) => {
                  try {
                    const toastId = toaster.loading({
                      title: "Reading...", 
                      description: "Please wait"
                    });
                    
                    const result = await handleSubmit(event, "action1");
                    
                    toaster.success({
                      id: toastId,
                      title: "Extracted text successfully!", 
                      description: "Looks great"
                    });
                    
                    return result;
                  } catch (error) {
                    toaster.error({
                      title: "Extraction failed", 
                      description: "Try again"
                    });
                    
                    console.error("Error during extraction:", error);
                  }
                }}
              >
                Extract from Bank Statement
              </Button>

              <Button
                flex="1"
                minW="150px"
                color="black"
                bg="white"
                py={3}
                borderRadius="md"
                fontWeight="bold"
                transition="background 0.2s ease-in-out"
                disabled={loading}
                _hover={{ bg: "gray.300" }}
                onClick={async (event) => {
                  try {
                    const toastId = toaster.loading({
                      title: "Reading...", 
                      description: "Please wait"
                    });
                    
                    const result = await handleSubmit(event, "action2");
                    
                    toaster.success({
                      id: toastId,
                      title: "Extracted text successfully!", 
                      description: "Looks great"
                    });
                    
                    return result;
                  } catch (error) {
                    toaster.error({
                      title: "Extraction failed", 
                      description: "Try again"
                    });
                    
                    console.error("Error during extraction:", error);
                  }
                }}
              >
                Extract from Invoice
              </Button>

              <Speak file={file} />
            </Flex>
          </Flex>
        </Box>

        {/* Ask Component with more space */}
        <Box 
          w="full" 
          maxW="4xl" 
          bgGradient="linear(to-r, gray.500, gray.700)" 
          p={6} 
          borderRadius="lg"
          boxShadow="xl"
          mt={6}
          flex="1"
          display="flex"
          flexDirection="column"
        >
          <Ask file={file} />
        </Box>
      </Flex>
    </Box>
  );
}

    {/* Webinar Creation Form */}
    {/* <Box
      maxW="lg"
      mx="auto"
      p={6}
      mt={10}
      bg="gray.800"
      borderRadius="xl"
      boxShadow="xl"
    >
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Create a Webinar
      </Heading>
      <form onSubmit={handleWeb}>
        <VStack spacing={4}>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            bg="gray.700"
            color="white"
            _placeholder={{ color: "gray.400" }}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg="gray.700"
            color="white"
            _placeholder={{ color: "gray.400" }}
          />
          <Textarea
            placeholder="Speaker"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            bg="gray.700"
            color="white"
            _placeholder={{ color: "gray.400" }}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            bg="gray.700"
            color="white"
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            bg="gray.700"
            color="white"
          />
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            _hover={{ bg: "blue.600" }}
          >
            Create Webinar
          </Button>
        </VStack>
      </form>
    </Box> */}
   




























  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   if (!file) return;

  //   setLoading(true);
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const response = await axios.post("http://localhost:5000/upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     setAnswer(response.data.answer);
  //   } catch (error) {
  //     console.error("Error fetching answer:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   if (!file || !question) return;

  //   setLoading(true);
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("question", question);

  //   try {
  //     const response = await axios.post("http://localhost:5000/upload", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     setAnswer(response.data.answer);
  //   } catch (error) {
  //     console.error("Error fetching answer:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };










{/* <input
                type="text"
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="border p-2 w-full"
              /> */}
              {/* <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? "Processing..." : "Get Answer"}
              </button> */}















  {/* {answer && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <strong>Extracted Details:</strong>
          <ul>
            {Object.entries(answer).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      )} */}