import { useReducer, useCallback } from "react";

export const MAX_LOG_ENTRIES = 100;

export type LogEntry = {
  message: string;
  type: 'start' | 'success' | 'warning' | 'error' | 'info';
};

// Define the actions for the reducer
type TerminalLogAction =
  | { type: "ADD_LOG"; payload: LogEntry }
  | { type: "CLEAR_LOGS" };

// Reducer to manage logs
const logReducer = (state: LogEntry[], action: TerminalLogAction): LogEntry[] => {
  switch (action.type) {
    case "ADD_LOG":
      // Limit logs to MAX_LOG_ENTRIES
      const updatedLogs = [...state, action.payload];
      return updatedLogs.length > MAX_LOG_ENTRIES
        ? updatedLogs.slice(updatedLogs.length - MAX_LOG_ENTRIES)
        : updatedLogs;
    case "CLEAR_LOGS":
      return [];
    default:
      return state;
  }
};

// Hook for managing terminal logs
export const useTerminalLogs = () => {
  const [logs, dispatch] = useReducer(logReducer, []);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    dispatch({ type: "ADD_LOG", payload: { message, type } });
  }, []);

  // Clear all logs
  const clearLogs = useCallback(() => {
    dispatch({ type: "CLEAR_LOGS" });
  }, []);

  return { logs, addLog, clearLogs };
};
