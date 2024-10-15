import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CodeFile {
  name: string;
  path: string;
  content: string;
}

interface CodeFileContextType {
  codeFiles: CodeFile[] | null;
  updateCodeFiles: (files: CodeFile[]) => void;
}

const CodeFileContext = createContext<CodeFileContextType | undefined>(undefined);

export const CodeFileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [codeFiles, setCodeFiles] = useState<CodeFile[] | null>(null);

  const updateCodeFiles = (files: CodeFile[]) => {
    setCodeFiles(files);
  };

  return (
    <CodeFileContext.Provider value={{ codeFiles, updateCodeFiles }}>
      {children}
    </CodeFileContext.Provider>
  );
};

export const useCodeFiles = () => {
  const context = useContext(CodeFileContext);
  if (context === undefined) {
    throw new Error('useCodeFiles must be used within a CodeFileProvider');
  }
  return context;
};
