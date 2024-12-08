import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalBody, Box, Text, Flex, Spinner, Button, ModalHeader } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { X } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '@chakra-ui/react';
import { getIdlContents, parseIdl, generateSdk } from '../../utils/uiUtils';
import { LogEntry } from '../../hooks/useTerminalLogs';
import { flushSync } from 'react-dom';

interface genTaskProps {
    isOpen: boolean;
    onClose: () => void;
    setIsPolling: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addLog: (message: string, type: LogEntry['type']) => void;
}

type TaskStatus = 'completed' | 'loading' | 'failed' | 'succeed' | 'warning';

type Task = {
    id: number;
    name: string;
    status: TaskStatus;
    type: 'main' | 'file';
};

export const TaskModal: React.FC<genTaskProps> = ({ isOpen, onClose, setIsPolling, setIsLoading, addLog }) => {
    const { projectContext, setProjectContext } = useProjectContext();
    const { user } = useAuthContext();
    const [walletPrivateKey, setWalletPrivateKey] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contextReady, setContextReady] = useState(false);
    const tasksInitializedRef = useRef(false);
    const toast = useToast();
    const isCloseDisabled = tasks.some(task => task.status === 'loading');

    

    useEffect(() => {
        if (projectContext) {
            setContextReady(true);
        }
    }, [projectContext]);

    useEffect(() => {
        if (isOpen && contextReady && !tasksInitializedRef.current) {
            if (!projectContext) return;

            const initialTasks: Task[] = [
                { id: 1, name: 'Fetch IDL File', status: 'loading', type: 'main' },
                { id: 2, name: 'Parse IDL File', status: 'loading', type: 'main' },
                { id: 3, name: 'Generate SDK', status: 'loading', type: 'main' },
                { id: 4, name: 'Generate UI Components', status: 'loading', type: 'main' },
            ];

            setTasks(initialTasks);
            tasksInitializedRef.current = true;

            runTasksSequentially();
        }

        if (!isOpen) {
            setTasks([]);
            tasksInitializedRef.current = false;
        }
    }, [isOpen, projectContext, contextReady]);

    const runTasksSequentially = async () => {
        if (!projectContext || !user) {
            console.error('Project context or user not available.');
            return;
        }
        try {
            // Fetch IDL File
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 1 ? { ...task, status: 'loading' } : task
                )
            );
            await new Promise((resolve) => setTimeout(resolve, 0)); 

            const idlContent = await getIdlContents(
                projectContext.id,
                projectContext,
                setIsPolling,
                setIsLoading,
                addLog
            );

            if (idlContent) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 1 ? { ...task, status: 'completed' } : task
                    )
                );
                await new Promise((resolve) => setTimeout(resolve, 0));
            } else {
                throw new Error('Failed to fetch IDL file');
            }

            await new Promise((resolve) => setTimeout(resolve, 500));

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 2 ? { ...task, status: 'loading' } : task
                )
            );
            await new Promise((resolve) => setTimeout(resolve, 0));

            const parsedIdl = parseIdl(idlContent, setProjectContext);

            if (parsedIdl) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === 2 ? { ...task, status: 'completed' } : task
                    )
                );
                await new Promise((resolve) => setTimeout(resolve, 0));
            } else {
                throw new Error('Failed to parse IDL file');
            }

            await new Promise((resolve) => setTimeout(resolve, 500));

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 3 ? { ...task, status: 'loading' } : task
                )
            );
            await new Promise((resolve) => setTimeout(resolve, 0));

            await generateSdk(
                projectContext,
                setProjectContext,
                parsedIdl.instructions,
                parsedIdl.accounts,
                setIsPolling,
                setIsLoading,
                addLog,
                user
            );

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 3 ? { ...task, status: 'completed' } : task
                )
            );
            await new Promise((resolve) => setTimeout(resolve, 0));

            await new Promise((resolve) => setTimeout(resolve, 500));

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 4 ? { ...task, status: 'loading' } : task
                )
            );
            await new Promise((resolve) => setTimeout(resolve, 0)); 

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === 4 ? { ...task, status: 'completed' } : task
                )
            );

            // Update project context
            setProjectContext((prevProjectContext) => ({
                ...prevProjectContext,
                details: {
                    ...prevProjectContext.details,
                    isSdk: true,
                    isUi: true,
                },
            }));

            toast({
                title: 'UI Generation Complete',
                description: 'The UI has been successfully generated.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            console.error('Error running tasks:', error);
            toast({
                title: 'Error generating UI',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.status === 'loading' ? { ...task, status: 'failed' } : task
                )
            );
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={isCloseDisabled ? () => {} : onClose}
            closeOnOverlayClick={!isCloseDisabled}
            closeOnEsc={!isCloseDisabled}
            isCentered
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader p={1} height={30}>
                    <Button
                        onClick={isCloseDisabled ? undefined : onClose}
                        variant="ghost"
                        size="sm"
                        colorScheme="gray"
                        position="absolute"
                        top={2}
                        right={2}
                        isDisabled={isCloseDisabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </ModalHeader>
                <ModalBody>
                    <Box mt={4}>
                        <Box>
                            {tasks.map((task) => (
                                <Flex key={task.id} align="center" mb={2}>
                                    <StatusSymbol status={task.status} />
                                    <Text fontSize="sm" fontWeight="medium" ml={2}>{task.name}</Text>
                                </Flex>
                            ))}
                        </Box>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

function StatusSymbol({ status }: { status: TaskStatus }) {
    return status === 'completed' ? (
        <CheckCircleIcon color="green.500" />
    ) : status === 'failed' ? (
        <CheckCircleIcon color="red.500" />
    ) : (
        <Spinner
            color="gray.300"
            size="sm"
            style={{ animationDuration: '1.4s' }}
        />
    );
}