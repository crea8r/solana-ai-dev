import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Docs {
  title: string;
  content: string;
  lastUpdated: Date;
}

interface DocsContextType {
  docs: Docs[] | null;
  updateDocs: (docs: Docs[]) => void;
}

const DocsContext = createContext<DocsContextType | undefined>(undefined);

export const DocsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [docs, setDocs] = useState<Docs[] | null>(null);

  const updateDocs = (newDocs: Docs[]) => {
    setDocs(newDocs);
  };

  return (
    <DocsContext.Provider value={{ docs, updateDocs }}>
      {children}
    </DocsContext.Provider>
  );
};

export const useDocs = () => {
  const context = useContext(DocsContext);
  if (context === undefined) {
    throw new Error('useDocs must be used within a DocsProvider');
  }
  return context;
};
