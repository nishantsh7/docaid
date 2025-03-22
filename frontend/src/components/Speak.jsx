import React from 'react';
import { useState } from "react";
import axios from "axios";
import { Button } from '@chakra-ui/react';

const Speak = ({file}) => {
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event, action) => {
        event.stopPropagation(); // Prevent event bubbling
        event.preventDefault(); // Stop form submission behavior
        const backendUrl = "https://backend-service-964145945663.asia-south2.run.app/"
    
        if (!file) {
          console.error("No file selected");
          return;
        }
    
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("action", action); // Pass action in formData
          // http://localhost:8080/upload
    
          const response = await axios.post(
            `${backendUrl}/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              responseType: "blob",
            }
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const audio = new Audio(url);
          audio.play();
          setIsPlaying(true);
          audio.onended = () => setIsPlaying(false);
          const link = document.createElement("a");
          link.href = url;
          link.download= "autoSpeech.mp3";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error fetching audio", error);
          console.error("Response:", error.response?.data);
        } finally {
          setLoading(false);
        }
      };
  return (
    <Button
    width="full"
          color="black"
          bg="white"
          py={3}
          borderRadius="md"
          fontWeight="bold"
          transition="background 0.2s ease-in-out"
          _hover={{ bg: "gray.300" }}
    type="button"
    onClick={(event) => handleSubmit(event,"action3")}
    disabled={loading}
    
  >
    {loading? "Speaking..." : "Speak"}
  </Button>
  )
}

export default Speak