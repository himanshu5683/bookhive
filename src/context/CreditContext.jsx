import React, { createContext, useContext, useState, useEffect } from 'react';

const CreditContext = createContext();

export const CreditProvider = ({ children }) => {
  const [userCredits, setUserCredits] = useState(() => {
    try {
      const stored = localStorage.getItem('bh_user_credits');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bh_user_credits', JSON.stringify(userCredits));
    } catch (e) {
      console.error('Failed to save credits:', e);
    }
  }, [userCredits]);

  const addCredits = (userId, amount, reason = 'Upload') => {
    setUserCredits(prev => ({
      ...prev,
      [userId]: (prev[userId] || 0) + amount,
    }));
  };

  const deductCredits = (userId, amount, reason = 'Download') => {
    setUserCredits(prev => ({
      ...prev,
      [userId]: Math.max(0, (prev[userId] || 0) - amount),
    }));
  };

  const getCredits = (userId) => userCredits[userId] || 0;

  return (
    <CreditContext.Provider value={{ userCredits, addCredits, deductCredits, getCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within CreditProvider');
  }
  return context;
};
