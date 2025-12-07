import React from "react";
import AIChatWidget from '../../components/AIChatWidget';
const AppWrapper = ({ children }) => {
  return (
    <>
      {children}
      <AIChatWidget />
    </>
  );
};

export default AppWrapper;