import React, { useEffect, useState } from 'react';
import { authAPI } from './services/api';

const NetworkTest = () => {
  const [testResults, setTestResults] = useState({
    envVars: {},
    apiConfig: {},
    directRequest: null,
    apiClientRequest: null
  });

  useEffect(() => {
    // Test environment variables
    const envVars = {
      REACT_APP_API_URL: process.env.REACT_APP_API_URL,
      REACT_APP_WS_URL: process.env.REACT_APP_WS_URL,
      REACT_APP_URL: process.env.REACT_APP_URL
    };

    // Test API config
    import('./config/api').then(API_CONFIG => {
      const apiConfig = {
        BASE_URL: API_CONFIG.default.BASE_URL
      };

      // Test direct fetch request
      const testDirectRequest = async () => {
        try {
          console.log('Testing direct fetch to:', `${process.env.REACT_APP_API_URL}/health`);
          const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
          const data = await response.json();
          return { success: true, data, status: response.status };
        } catch (error) {
          console.error('Direct fetch error:', error);
          return { success: false, error: error.message };
        }
      };

      // Test API client request
      const testApiClientRequest = async () => {
        try {
          console.log('Testing API client request to /auth/verify');
          const response = await authAPI.verify();
          return { success: true, data: response };
        } catch (error) {
          console.error('API client error:', error);
          return { success: false, error: error.message };
        }
      };

      // Run tests
      Promise.all([
        testDirectRequest(),
        testApiClientRequest()
      ]).then(([directResult, apiClientResult]) => {
        setTestResults({
          envVars,
          apiConfig,
          directRequest: directResult,
          apiClientRequest: apiClientResult
        });
      });
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Network Test Results</h2>
      
      <h3>Environment Variables:</h3>
      <pre>{JSON.stringify(testResults.envVars, null, 2)}</pre>
      
      <h3>API Config:</h3>
      <pre>{JSON.stringify(testResults.apiConfig, null, 2)}</pre>
      
      <h3>Direct Fetch Request:</h3>
      <pre>{JSON.stringify(testResults.directRequest, null, 2)}</pre>
      
      <h3>API Client Request:</h3>
      <pre>{JSON.stringify(testResults.apiClientRequest, null, 2)}</pre>
    </div>
  );
};

export default NetworkTest;