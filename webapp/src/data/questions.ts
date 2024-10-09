export const questions = [
    // General
    {
        question: `What's the name of your dApp?`,
        example: null
    },
    {
        question: `Can you describe your dApp in a few words?`,
        example: `For example: "A decentralized marketplace for NFTs," "A blockchain-based voting platform for secure elections," "A peer-to-peer lending system using cryptocurrency."`
    },
    {
        question: `Can you describe the main purpose or goal of your dApp?`,
        example: `For example: "To allow users to trade NFTs directly without intermediaries," "To ensure transparency and security in voting processes," "To connect borrowers and lenders through smart contracts, removing the need for traditional banks."`
    },

    // Actions 
    // On-chain Actions
    {
        question: `What are the key features or actions users will need to perform on-chain?`,
        example: `For example: "Sending and receiving tokens," "Creating and trading NFTs," "Staking tokens to earn rewards."`
    },
    {
        question: `What actions can users take on-chain in your dApp?`,
        example: `For example: "Users can create new accounts," "Users can vote on proposals," "Users can transfer assets between wallets."`
    },
    {
        question: `Do you want users to provide specific information for these actions?`,
        example: `For example: "Users need to provide wallet addresses when transferring tokens," "Users must input voting choices for governance proposals," "Users must select the amount of tokens to stake."`
    },
    {
        question: `Should any actions trigger special processes or events?`,
        example: `For example: "Trigger an event after a successful token transfer," "Initiate a reward distribution after staking," "Emit an event when a new NFT is minted."`
    },
    {
        question: `Are there any conditions or rules for these actions?`,
        example: `For example: "Users must have a minimum balance to participate in governance," "NFTs can only be minted by verified accounts," "Tokens can only be transferred during active trading hours."`
    },
    {
        question: `Do you need any special security features for these actions?`,
        example: `For example: "Require multi-signature approval for large transactions," "Implement rate limits to prevent abuse," "Enforce identity verification for certain actions."`
    },
    {
        question: `Should certain actions only be allowed under specific conditions?`,
        example: `For example: "Users can only vote if they hold governance tokens," "Token transfers are restricted based on account status," "Rewards can only be claimed after a staking period has ended."`
    },
    {
        question: `Instruction Frequency & Timing: Would any of the on-chain actions need to happen at regular intervals or in response to specific events (e.g., time-based triggers, external conditions)?`,
        example: `For example: "Stake rewards distributed every 24 hours," "A token burn occurs weekly," "Automatic withdrawals when account balances exceed a threshold."`
    },
    {
        question: `Transaction Batching or Grouping: Should any of the on-chain actions be grouped together into a single transaction, or can they be executed separately?`,
        example: `For example: "Multiple token transfers can be batched into a single transaction," "Users can mint multiple NFTs in one transaction," "Actions related to governance (voting, staking) are executed together."`
    },
    {
        question: `Preconditions for Instructions: Are there any preconditions (such as account states or balances) that must be met before an instruction can be executed?`,
        example: `For example: "Accounts must have a minimum balance to perform a transfer," "Staking can only occur if the user holds the correct type of token," "Voting requires tokens to be locked in the governance pool."`
    },
    {
        question: `Outputs of Instructions: What should the output or result of each on-chain action be (e.g., updated account data, emitted events)?`,
        example: `For example: "An event is emitted when a token is transferred," "Account balances are updated after staking," "A confirmation message is sent after an NFT is minted."`
    },
    {
        question: `Resource Costs or Limits: Are there any resource limits (e.g., compute units or transaction size) that need to be considered for on-chain actions?`,
        example: `For example: "Ensure transaction size does not exceed the block limit," "Limit the number of tokens transferred in one transaction to reduce costs," "Optimize compute unit usage during smart contract execution."`
    },
  
    // Off-chain Actions
    {
        question: "Should any of these events be tracked off-chain for future reference or analytics?",
        example: ``
    },
    {
        question: "Do you want the dApp to show notifications for certain events?",
        example: ``
    },
    {
        question: "How will users interact with your dApp?",
        example: ``
    },
    {
        question: "External Data Sources: Will any off-chain actions involve interacting with external data sources (e.g., oracles, APIs)?",
        example: ``
    },
    {
        question: "Processing Off-chain Data: Should off-chain actions involve processing user data, and how should the results be sent back on-chain or to the user?",
        example: ``
    },
    {
        question: "Authorization for Off-chain Actions: Who is allowed to trigger or execute off-chain actions (e.g., automated processes, specific users)?",
        example: ``
    },
    {
        question: "Triggers for Off-chain Actions: What events should trigger off-chain actions (e.g., a successful transaction, an emitted on-chain event)?",
        example: ``
    },
    {
        question: "Relationships Between Off-chain Actions: How do different off-chain actions relate to each other?",
        example: ``
    },
  
    // Data 
    // On-chain Data
    {
        question: "What types of accounts will your dApp need on-chain?",
        example: ``
    },
    {
        question: "Should any of these accounts manage tokens or other digital assets?",
        example: ``
    },
    {
        question: "Will users need special accounts that the system manages for them automatically (e.g., program-derived addresses or PDAs)?",
        example: ``
    },
    {
        question: "What information should each on-chain account store?",
        example: ``
    },
    {
        question: "Which on-chain accounts need to interact with each other?",
        example: ``
    },
    {
        question: "Are there any special states or conditions that on-chain accounts can be in?",
        example: ``
    },
    {
        question: "What should happen when an account is in a specific state?",
        example: ``
    },
    {
        question: "What data will need to be stored on-chain?",
        example: ``
    },
    {
        question: "Is any of this data sensitive, or should it all be publicly accessible?",
        example: ``
    },
  
    // Off-chain Data
    {
        question: "What types of off-chain data will your dApp need to manage?",
        example: ``
    },
    {
        question: "How will off-chain accounts or data interact with on-chain data?",
        example: ``
    },
    {
        question: "Should off-chain data be linked to specific on-chain accounts or events?",
        example: ``
    },
  
    // Assets
    {
        question: "Will your dApp involve tokens or NFTs?",
        example: ``
    },
    {
        question: "What should users be able to do with these tokens or NFTs?",
        example: ``
    },
    {
        question: "Will users be able to earn rewards or incentives with tokens?",
        example: ``
    },
    {
        question: "Will there be any fees for using certain features?",
        example: ``
    },
    {
        question: "How will token distribution or rewards work in your dApp?",
        example: ``
    },
  
    // Error Handling
    {
        question: "What should happen if an off-chain or on-chain action fails?",
        example: ``
    },
    {
        question: "Should there be any retry logic or fallback mechanisms?",
        example: ``
    },
    {
        question: "How should error messages or failure events be communicated to users?",
        example: ``
    },
  
    // Security & Authorization
    {
        question: "User Roles & Permissions: Who has access to which features or actions in your dApp? Are certain users or groups allowed to perform certain actions or manage certain accounts?",
        example: ``
    },
    {
        question: "Multi-signature Requirements: Do any on-chain actions require multiple signatures or approvals to execute?",
        example: ``
    },
  
    // Additional
    {
        question: "Transaction Optimization: Should the dApp prioritize minimizing transaction fees and maximizing throughput?",
        example: ``
    },
    {
        question: "Gas Price Strategy (if applicable): How will gas fees be handled, and should users be able to set gas preferences?",
        example: `For example: "Users can set their preferred gas price," "The dApp automatically selects the optimal gas price based on network conditions."`
    }
];