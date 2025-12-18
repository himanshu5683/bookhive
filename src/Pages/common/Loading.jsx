import React from "react";
import { motion } from "framer-motion";
import "../../styles/Loading.css";

const Loading = () => (
  <motion.div 
    className="bh-global-loading-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div 
      className="bh-global-loader"
      animate={{ 
        rotate: 360,
      }}
      transition={{ 
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </motion.div>
);

export default Loading;
