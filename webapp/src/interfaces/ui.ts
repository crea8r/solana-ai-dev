export interface FormElement {
    id: string; // Unique identifier for the form element
    type: "input" | "dropdown" | "button" | "checkbox" | "radio" | "staticText"; // Type of form element
    label?: string; // Label to display for the element
    placeholder?: string; // Placeholder text for input fields
    inputType?: "text" | "number" | "password" | "email"; // Only relevant for input fields
    options?: string[]; // Options for dropdown, checkbox, or radio elements
    value?: string | number | boolean; // Default value for the form element
    description?: string; // Description or tooltip for the element
    validation?: {
        required?: boolean; // Whether the field is required
        pattern?: string; // Regex pattern for validation
        min?: number; // Minimum value (for number inputs)
        max?: number; // Maximum value (for number inputs)
        errorMessage?: string; // Custom error message
    };
    disabled?: boolean; // Whether the element is disabled
    action?: string; // Action to perform when the element is clicked (for buttons)
}

export interface ConfirmationField {
    id: string; // Unique identifier for the field
    type: "staticText" | "link"; // Specifies the type of content
    label: string; // Label displayed for the field (e.g., "Recipient Address")
    description?: string; // Optional description or tooltip for the field
    value?: string; // Value to display (e.g., recipient address)
    urlTemplate?: string; // URL template (for links) to display a clickable link
}

export interface ConfirmationButton {
    id: string; // Unique identifier for the button
    type: "button"; // Type of the element (always "button" in this case)
    label: string; // Text displayed on the button
    action: string; // Action to perform when the button is clicked (e.g., "submitTransaction")
    description?: string; // Optional description of what the button does
}

export interface ConfirmationModal {
    isModal: boolean; // Specifies if the component is a modal
    title: string; // Title of the confirmation modal
    content: {
        fields: ConfirmationField[]; // Fields to display in the modal for review/confirmation
    };
    buttons: ConfirmationButton[]; // List of buttons (e.g., Confirm, Cancel)
}

export interface FeedbackSection {
    title: string; // Title of the feedback section (e.g., "Transaction Status")
    elements: FeedbackElement[]; // Array of feedback elements (e.g., success or error messages)
}
  
interface FeedbackElement {
    id: string; // Unique identifier for the feedback element
    type: "notification" | "alert"; // Type of feedback (e.g., a notification or alert)
    variant: "success" | "error" | "info" | "warning"; // Specifies the variant type
    message: string; // Main message to display (e.g., "Transfer Successful!")
    details?: FeedbackDetails; // Optional additional details (e.g., transaction hash or error reason)
    description?: string; // Description explaining the feedback
}

export interface FeedbackDetails {
    transactionHash?: {
      label: string; // Label for the transaction hash (e.g., "Transaction Hash")
      type: "link"; // Specifies that this detail is a clickable link
      urlTemplate: string; // URL template for the transaction hash link
    };
    errorReason?: {
      label: string; // Label for the error reason (e.g., "Reason")
      type: "text"; // Specifies that this detail is plain text
    };
}

export interface HistorySection {
    title: string; // Title of the history section (e.g., "Recent Transfers")
    list: HistoryList; // List configuration for displaying history entries
}
  
export interface HistoryList {
    type: "transactionHistoryList" | "activityLog"; // Type of history list (e.g., transaction history or general activity log)
    fields: string[]; // Array of fields to display for each history entry (e.g., ["timestamp", "recipientAddress", "amount"])
    description?: string; // Optional description of the history section
    maxItems?: number; // Optional maximum number of items to display
    showPagination?: boolean; // Whether to show pagination controls
}

export interface OptionalFeatures {
    qrCodeScanner?: {
      enabled: boolean; // Whether the QR code scanner is enabled
      type: "button"; // The type of UI element to trigger the QR code scanner
      label: string; // Label for the QR code scanner button
      description?: string; // Optional description of the feature
    };
    exportDataButton?: {
      enabled: boolean; // Whether the export data feature is enabled
      type: "button"; // The type of UI element to export data
      label: string; // Label for the export button
      formatOptions: ("csv" | "json" | "pdf")[]; // Supported formats for exporting data
      description?: string; // Optional description of the export feature
    };
    darkModeToggle?: {
      enabled: boolean; // Whether the dark mode toggle is enabled
      type: "switch"; // The type of UI element to toggle dark mode
      label: string; // Label for the toggle switch
      description?: string; // Optional description of the dark mode feature
    };
    notificationsToggle?: {
      enabled: boolean; // Whether the notifications toggle is enabled
      type: "switch"; // The type of UI element to enable or disable notifications
      label: string; // Label for the toggle switch
      description?: string; // Optional description of the notifications feature
    };
}

export interface UiStructure {
    header: {
      title: string;
      navigationMenu: string[];
      walletInfo: {
        connectedWalletAddress: {
          type: "text";
          placeholder: string;
          description: string;
        };
        balanceDisplay: {
          type: "text";
          description: string;
        };
        connectWalletButton: {
          type: "button";
          label: string;
          description: string;
        };
      };
    };
    mainSection: {
      title: string;
      layout: "vertical" | "horizontal";
      formElements: FormElement[];
  };
    confirmationModal: ConfirmationModal;
    feedbackSection: FeedbackSection;
    historySection: HistorySection;
    optionalFeatures?: OptionalFeatures;
}
  
  