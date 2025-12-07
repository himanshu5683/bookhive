import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import Loading from "./Loading";
import AuthContext from "../../auth/AuthContext";
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