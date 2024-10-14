// ------------ ChatBox ----------
export interface Message {
    content: string | JSX.Element;
    sender: 'user' | 'bot';
}

export interface ConversationStep {
    botMessage: string;
    userResponse: string | string[];
    action?: (response: string | string[]) => void;
    delay: number;
}

export interface UserResponses {
    General: {
        dAppName: string;
        Description: string;
        MainPurpose: string;
    };
    Actions: {
        OnChainActions: {
            KeyFeatures: string;
            UserActions: string;
            ActionSpecificInput: string;
            TriggersAndEvents: string;
            Conditions: string;
            SecurityFeatures: string;
            ConditionalActions: string;
            InstructionTiming: string;
            TransactionBatching: string;
            Preconditions: string;
            Outputs: string;
            ResourceLimits: string;
        };
        OffChainActions: {
            EventTracking: string;
            Notifications: string;
            UserInteraction: string;
            ExternalDataSources: string;
            DataProcessing: string;
            Authorization: string;
            Triggers: string;
            Relationships: string;
        };
    };
    Data: {
        OnChainData: {
            AccountTypes: string;
            TokenManagement: string;
            SystemManagedAccounts: string;
            AccountData: string;
            AccountInteractions: string;
            AccountStates: string;
            AccountStateBehavior: string;
            DataStorage: string;
            SensitiveData: string;
        };
        OffChainData: {
            DataTypes: string;
            DataInteraction: string;
            DataLinkage: string;
        };
    };
    Assets: {
        TokenNFTUse: string;
        UserActionsForTokens: string;
        RewardsIncentives: string;
        Fees: string;
        TokenDistribution: string;
    };
    ErrorHandling: {
        ErrorResponse: string;
        RetryFallbackLogic: string;
        ErrorCommunication: string;
    };
    SecurityAuthorization: {
        RolesPermissions: string;
        MultiSignature: string;
    };
    Additional: {
        TransactionOptimization: string;
        GasPriceStrategy: string;
    };
}