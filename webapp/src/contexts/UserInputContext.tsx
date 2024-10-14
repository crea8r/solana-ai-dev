import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserInputContextType {
  userInputs: Record<string, string | string[]>;
  setUserInput: (key: string, value: string | string[]) => void;
}

const UserInputContext = createContext<UserInputContextType | undefined>(undefined);

export const UserInputProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userInputs, setUserInputs] = useState<Record<string, string | string[]>>({});

  const setUserInput = (key: string, value: string | string[]) => {
    setUserInputs(prevInputs => ({ ...prevInputs, [key]: value }));
  };

  return (
    <UserInputContext.Provider value={{ userInputs, setUserInput }}>
      {children}
    </UserInputContext.Provider>
  );
};

export const useUserInput = () => {
  const context = useContext(UserInputContext);
  if (!context) {
    throw new Error('useUserInput must be used within a UserInputProvider');
  }
  return context;
};