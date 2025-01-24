export interface UiStructure {
  header: {
    title: string;
    navigationMenu?: string[];
  };
  mainSection: {
    title: string;
    layout: "vertical" | "horizontal";
    elements: Element[];
  };
  confirmationModal?: ConfirmationModal;
  feedbackSection?: FeedbackSection;
  historySection?: HistorySection;
  optionalFeatures?: OptionalFeatures;
}

export interface Element {
  id: string;
  type: "text" | "input" | "button" | string; // Add more types as needed
  label?: string;
  value?: string; // For text elements or default values
  properties?: {
    fontSize?: string;
    color?: string;
    fontWeight?: string;
    [key: string]: any; // To allow additional optional properties
  };
  placeholder?: string; // For input elements
  description?: string; // Description of the form element
  validation?: {
    required?: boolean;
    walletConnected?: boolean;
    roleCheck?: string;
    errorMessage?: string;
  };
  disabledByDefault?: boolean; // For buttons or interactive elements
}

export interface ConfirmationModal {
  title: string;
  content: {
    fields: Element[];
  };
  buttons: Element[];
}

export interface FeedbackSection {
  title: string;
  elements: Element[];
}

export interface HistorySection {
  title: string;
  list: {
    type: string;
    fields: string[];
    description?: string;
    maxItems?: number;
    showPagination?: boolean;
  };
}

export interface OptionalFeatures {
  [key: string]: {
    enabled: boolean;
    type: "button" | "switch" | string;
    label: string;
    description: string;
    formatOptions?: string[]; // For export or similar features
  };
}
