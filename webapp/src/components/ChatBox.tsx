// ------------ Imports ----------
'use client';
import React, { useState, useEffect, useRef } from 'react';
//import { useSelector, useDispatch } from 'react-redux';
//import { RootState } from '../redux/store';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Mic, Paperclip, Bot } from 'lucide-react';

import userResponses from '../data/userResponsesExample1.json';
import { questions } from '../data/questions';
import { UserResponses, ConversationStep, Message } from '../types/types';
import { useUserInput } from '../contexts/UserInputContext';

// ------------ ChatBox ----------
interface ChatBoxProps {
  userName: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ userName }) => {
  // ------------ State declarations + other variables ----------
  const { setUserInput } = useUserInput(); // Use the context instead of Redux
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<number | undefined>(undefined);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const userResponsesTyped: UserResponses = userResponses;

  // ------------ Conversation Steps array ----------
  const conversationSteps: ConversationStep[] = [
    {
      botMessage: `Hello, ${userName}! Let's start with some questions about your dApp...`,
      userResponse: '',
      action: undefined,
      delay: 1000,
    },
    {
      botMessage: questions[0].question,
      userResponse: userResponsesTyped.General.dAppName,
      action: (response: string | string[]) => setUserInput('projectName', response as string),
      delay: 2000,
    },
    {
      botMessage: questions[1].question,
      userResponse: userResponsesTyped.General.Description,
      action: (response: string | string[]) => setUserInput('description', response as string),
      delay: 2000,
    },
    {
      botMessage: questions[2].question,
      userResponse: userResponsesTyped.General.MainPurpose,
      action: (response: string | string[]) => setUserInput('purpose', response as string),
      delay: 2000,
    },
    {
      botMessage: questions[3].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.KeyFeatures,
      action: (response: string | string[]) => setUserInput('primaryFeatures', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[4].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.UserActions,
      action: (response: string | string[]) => setUserInput('userActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[5].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.ActionSpecificInput,
      action: (response: string | string[]) => setUserInput('actionSpecificInformation', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[6].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.TriggersAndEvents,
      action: (response: string | string[]) => setUserInput('specialProcessesOrEvents', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[7].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.Conditions,
      action: (response: string | string[]) => setUserInput('conditionsOrRulesForActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[8].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.SecurityFeatures,
      action: (response: string | string[]) => setUserInput('securityConsiderations', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[9].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.ConditionalActions,
      action: (response: string | string[]) => setUserInput('conditionsForActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[10].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.InstructionTiming,
      action: (response: string | string[]) => setUserInput('instructionFrequencyAndTiming', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[11].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.TransactionBatching,
      action: (response: string | string[]) => setUserInput('transactionBatchingOrGrouping', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[12].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.Preconditions,
      action: (response: string | string[]) => setUserInput('preconditionsForInstructions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[13].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.Outputs,
      action: (response: string | string[]) => setUserInput('outputsOfInstructions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[14].question,
      userResponse: userResponsesTyped.Actions.OnChainActions.ResourceLimits,
      action: (response: string | string[]) => setUserInput('resourceCostsOrLimits', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[15].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.EventTracking,
      action: (response: string | string[]) => setUserInput('trackedOffChainEvents', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[16].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.Notifications,
      action: (response: string | string[]) => setUserInput('notificationsForEvents', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[17].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.UserInteraction,
      action: (response: string | string[]) => setUserInput('userInteraction', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[18].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.ExternalDataSources,
      action: (response: string | string[]) => setUserInput('externalDataSources', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[19].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.DataProcessing,
      action: (response: string | string[]) => setUserInput('processingOffChainData', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[20].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.Authorization,
      action: (response: string | string[]) => setUserInput('authorizationForOffChainActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[21].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.Triggers,
      action: (response: string | string[]) => setUserInput('triggersForOffChainActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[22].question,
      userResponse: userResponsesTyped.Actions.OffChainActions.Relationships,
      action: (response: string | string[]) => setUserInput('relationshipsBetweenOffChainActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[23].question,
      userResponse: userResponsesTyped.Data.OnChainData.AccountTypes,
      action: (response: string | string[]) => setUserInput('accountTypes', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[24].question,
      userResponse: userResponsesTyped.Data.OnChainData.TokenManagement,
      action: (response: string | string[]) => setUserInput('tokenManagement', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[25].question,
      userResponse: userResponsesTyped.Data.OnChainData.SystemManagedAccounts,
      action: (response: string | string[]) => setUserInput('systemManagedAccounts', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[26].question,
      userResponse: userResponsesTyped.Data.OnChainData.AccountData,
      action: (response: string | string[]) => setUserInput('accountInformation', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[27].question,
      userResponse: userResponsesTyped.Data.OnChainData.AccountInteractions,
      action: (response: string | string[]) => setUserInput('accountInteractions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[28].question,
      userResponse: userResponsesTyped.Data.OnChainData.AccountStates,
      action: (response: string | string[]) => setUserInput('accountStates', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[29].question,
      userResponse: userResponsesTyped.Data.OnChainData.AccountStateBehavior,
      action: (response: string | string[]) => setUserInput('conditionsOrRulesForActions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[30].question,
      userResponse: userResponsesTyped.Data.OnChainData.DataStorage,
      action: (response: string | string[]) => setUserInput('onChainDataStorage', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[31].question,
      userResponse: userResponsesTyped.Data.OnChainData.SensitiveData,
      action: (response: string | string[]) => setUserInput('sensitiveOnChainData', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[32].question,
      userResponse: userResponsesTyped.Data.OffChainData.DataTypes,
      action: (response: string | string[]) => setUserInput('offChainDataTypes', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[33].question,
      userResponse: userResponsesTyped.Data.OffChainData.DataInteraction,
      action: (response: string | string[]) => setUserInput('offChainDataInteraction', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[34].question,
      userResponse: userResponsesTyped.Data.OffChainData.DataLinkage,
      action: (response: string | string[]) => setUserInput('offChainDataLinkage', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[35].question,
      userResponse: userResponsesTyped.Assets.TokenNFTUse,
      action: (response: string | string[]) => setUserInput('tokenOrNFTUsage', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[36].question,
      userResponse: userResponsesTyped.Assets.UserActionsForTokens,
      action: (response: string | string[]) => setUserInput('userActionsForTokens', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[37].question,
      userResponse: userResponsesTyped.Assets.RewardsIncentives,
      action: (response: string | string[]) => setUserInput('rewardsOrIncentives', response as string[]),
      delay: 2000,
    },
    { 
      botMessage: questions[38].question,
      userResponse: userResponsesTyped.Assets.Fees,
      action: (response: string | string[]) => setUserInput('feesForUsingFeatures', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[39].question,
      userResponse: userResponsesTyped.Assets.TokenDistribution,
      action: (response: string | string[]) => setUserInput('tokenDistributionOrRewards', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[40].question,
      userResponse: userResponsesTyped.ErrorHandling.ErrorResponse,
      action: (response: string | string[]) => setUserInput('errorResponse', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[41].question,
      userResponse: userResponsesTyped.ErrorHandling.RetryFallbackLogic,
      action: (response: string | string[]) => setUserInput('retryLogicOrFallback', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[42].question,
      userResponse: userResponsesTyped.ErrorHandling.ErrorCommunication,
      action: (response: string | string[]) => setUserInput('errorMessageCommunication', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[43].question,
      userResponse: userResponsesTyped.SecurityAuthorization.RolesPermissions,
      action: (response: string | string[]) => setUserInput('userRolesAndPermissions', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[44].question,
      userResponse: userResponsesTyped.SecurityAuthorization.MultiSignature,
      action: (response: string | string[]) => setUserInput('multiSignatureRequirements', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[45].question,
      userResponse: userResponsesTyped.Additional.TransactionOptimization,
      action: (response: string | string[]) => setUserInput('transactionOptimization', response as string[]),
      delay: 2000,
    },
    {
      botMessage: questions[46].question,
      userResponse: userResponsesTyped.Additional.GasPriceStrategy,
      action: (response: string | string[]) => setUserInput('gasPriceStrategy', response as string[]),
      delay: 2000,
    },
  ];


  // ------------ processConversation function ----------
  const processConversation = async () => {
    if (step !== undefined && step < conversationSteps.length) {
      const currentStep = conversationSteps[step];

      //console.log(`Processing step: ${step}, botMessage: ${currentStep.botMessage}`);

      // Bot message
      if (currentStep.botMessage) {
        await new Promise(resolve => setTimeout(resolve, currentStep.delay || 1000));
        setMessages(prev => [
          ...prev, 
          { 
            content: (
              <div>
                <div>{currentStep.botMessage}</div>
                {typeof questions[step].example === 'string' && (
                  <div className="text-sm text-gray-300 dark:text-gray-400" style={{ fontStyle: 'italic', marginTop: '4px' }}>
                    {questions[step].example}
                  </div>
                )}
              </div>
            ), 
            sender: 'bot' 
          }
        ]);
      }

      // User response
      if (currentStep.userResponse) {
        await new Promise(resolve => setTimeout(resolve, currentStep.delay || 1000));
        setMessages(prev => [
          ...prev,
          { content: Array.isArray(currentStep.userResponse) ? currentStep.userResponse.join(', ') : currentStep.userResponse, sender: 'user' }
        ]);

        // Dispatch action after the message has been added
        if (currentStep.action) {
          currentStep.action(currentStep.userResponse);
        }
      }
      
      setStep(prevStep => (prevStep !== undefined ? prevStep + 1 : 0));
    }
  };

  // ------------ handleSend function ----------
  const handleSend = () => {
    if (input.trim() && step !== undefined) {
      setMessages(prev => [...prev, { content: input, sender: 'user' }]);
      const currentStep = conversationSteps[step];

      if (currentStep && currentStep.action) {
        currentStep.action(input);
      }

      setInput('');
      setStep(step + 1);
    }
  };

// ------------ useEffect hooks ----------
// simulate conversation
// Set step to 0 after component mounts
useEffect(() => {
  setStep(0);
}, []);

// Only run processConversation when step is defined
useEffect(() => {
  if (step !== undefined) {
    processConversation();
  }
}, [step]);

// Scroll to the latest message whenever messages update
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);
  

  return (
    <div className="flex-1 flex flex-col h-full p-6">
      <div className="mx-auto w-full h-full bg-white/30 dark:bg-[#1e293b]/50 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-[#334155] transition-opacity duration-500 ease-in-out opacity-100">
        <div className="h-full flex flex-col">
          <div className="flex flex-row justify-between items-center gap-2 p-3 bg-lightAccent/70 dark:bg-[#1e293b] backdrop-blur-sm border-b border-gray-200 dark:border-[#334155]">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-dark-700 dark:text-darkAccent" />
              <h2 className="text-md font-semibold text-gray-700 dark:text-darkAccent font-roboto-mono">Assistant</h2>
            </div>
          </div>
          <div ref={scrollAreaRef} className="flex-grow p-4 overflow-y-auto custom-scrollbar">
            {messages.map((message, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`mb-8 max-w-[80%] p-3 rounded-2xl text-sm ${
                    message.sender === 'user'
                      ? 'tx-md bg-white text-lightAccent dark:bg-[#1e293b] dark:text-darkAccent border border-gray-200 dark:border-[#334155]'
                      : 'tx-md text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white bg-opacity-70 dark:bg-[#1e293b] backdrop-blur-sm border-t border-gray-200 dark:border-[#334155]">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="text-gray-500 dark:text-[#94a3b8] hover:text-gray-700 dark:hover:text-[#93c5fd]">
                <Paperclip className="h-5 w-5 text-lightAccent dark:text-darkAccent" />
              </Button>
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-grow bg-white dark:bg-[#334155] border-gray-300 dark:border-[#334155] text-gray-800 dark:text-gray-100 border border-lightAccent dark:border-darkAccent focus:outline-lightAccent focus:border-lightAccent focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent placeholder-[#64748b]"
              />
              <Button variant="outline" size="icon" className="text-gray-500 dark:text-[#94a3b8] hover:text-gray-700 dark:hover:text-[#93c5fd]">
                <Mic className="h-5 w-5 text-lightAccent dark:text-darkAccent" />
              </Button>
              <Button onClick={handleSend} className="bg-white hover:bg-darkAccent text-white dark:bg-gray-400 dark:hover:bg-[#93c5fd]">
                <Send className="h-5 w-5 text-lightAccent dark:text-darkAccent" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;