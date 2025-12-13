// Test file to verify environment variables are loaded correctly
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('REACT_APP_WS_URL:', process.env.REACT_APP_WS_URL);
console.log('REACT_APP_URL:', process.env.REACT_APP_URL);

export const testEnv = () => {
  return {
    apiUrl: process.env.REACT_APP_API_URL,
    wsUrl: process.env.REACT_APP_WS_URL,
    appUrl: process.env.REACT_APP_URL
  };
};

export default testEnv;