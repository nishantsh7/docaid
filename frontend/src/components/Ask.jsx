import React, { useState } from "react";
import axios from "axios";
import { Textarea,Flex, Button, Box, Heading, Text} from "@chakra-ui/react";

const Ask = ({ file }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(null);
   const backendUrl = "https://backend-service-897243952721.asia-south2.run.app/";

  const handleQuestion = async (e, action) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault();

    if (!file) {
      console.error("No file selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", action);
      formData.append("question", question);

      const response = await axios.post(
        `${backendUrl}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.error || "Unknown error");
      }

      console.log("Response data:", response.data); // Debugging
      setAnswer(response.data.answer); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching answer", error);
      setError(error.response?.data?.error || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <Box>
    <Flex p={4} gap={2} align="center">
       <Textarea
    placeholder="Question"
    value={question}
    onChange={(e) => setQuestion(e.target.value)}
    size="md"
    color="white"
    bg="transparent"
    borderRadius="md"
    border="1px solid"
    borderColor="gray.600"
    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
    flex="70%" // Takes 70% of the space
    required
  />

<Button
    type="button"
    onClick={(e) => handleQuestion(e, "action4")}
    color="black"
    bg="white"
    py={3}
    borderRadius="md"
    fontWeight="bold"
    transition="background 0.2s ease-in-out"
    _hover={{ bg: "gray.300" }}
    disabled={loading}
    flex="30%" // Takes 30% of the space
  >
    {loading ? "Thinking..." : "Ask"}
  </Button>
    </Flex>
    {error && <Text color="red.500" mt={2}>Error: {error}</Text>}

    {answer && (
      <Box mt={4} p={4} borderWidth="1px" borderRadius="md" overflow="auto" maxH="300px">
      <Heading as="h2" size="md" fontWeight="bold" color="white">
        Answer:
      </Heading>
      <Text color="white">{answer}</Text>
    </Box>
    )}
    </Box>
  );
};

export default Ask;