// Simple test component to debug API calls
import React, { useEffect, useState } from "react";
import apiClient from "./services/api";

const TestAPI = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log("Testing API call...");
        console.log("API Client config:", apiClient.defaults);
        
        const response = await apiClient.post("/ai/chat", { 
          message: "Hello" 
        });
        
        console.log("API Response:", response);
        setResult(response.data);
      } catch (err) {
        console.error("API Error:", err);
        console.error("Error response:", err.response);
        setError(err.message);
      }
    };

    testAPI();
  }, []);

  return (
    <div>
      <h2>API Test Results</h2>
      {result && (
        <div>
          <h3>Success:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAPI;