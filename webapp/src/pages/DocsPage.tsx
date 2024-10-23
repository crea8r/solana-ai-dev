import React, { useEffect, useState } from 'react';
//import { genDocs } from '../prompts/genDocs';
import promptAI from '../services/prompt';
import { useProjectContext } from '../contexts/ProjectContext';
import {
  FileText,
  Database,
  Code,
  Zap,
  AlertTriangle,
  Coins,
  Shield,
  Download,
} from 'lucide-react';
import { 
  Text,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
 } from '@chakra-ui/react';
import { 
  ChevronLeftIcon,
  ChevronDownIcon
 } from '@chakra-ui/icons';
import { TbListTree } from "react-icons/tb";
import { PiShareNetwork } from "react-icons/pi";
import { GrTest } from "react-icons/gr";
import { GoZap } from "react-icons/go";
import { MdErrorOutline } from "react-icons/md";
import { BsCoin } from "react-icons/bs";
import { MdOutlineSecurity } from "react-icons/md";
import { IoRocketOutline } from "react-icons/io5";
import { FaRegFileAlt } from "react-icons/fa";
import LoadingModal from '../components/LoadingModal';
import { useDocs } from '../contexts/DocsContext';

const DocPage: React.FC = () => {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [selectedSection, setSelectedSection] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { projectContext, setProjectContext } = useProjectContext();
  const [isLoading, setIsLoading] = useState(false);

  //const docsPrompt = genDocs(projectContext);
  const { updateDocs } = useDocs();

  const fetchDocumentation = async () => {
    /*
    if (docsPrompt) {
      setIsLoading(true);
      const choices = await promptAI(docsPrompt);
      // console.log('Prompt AI response:', choices);
      if (choices && choices.length > 0) {
        const content = choices[0].message?.content || '';
        // console.log('Fetched documentation content:', content);
        setSections(splitIntoSections(content));
        const newDocs = [
          { title: 'Documentation', content, lastUpdated: new Date() },
        ];
        updateDocs(newDocs); 
        setProjectContext((prevProjectContext) => ({ 
          ...prevProjectContext, 
          details: { ...prevProjectContext.details, docs: newDocs } }));
      }
      setIsLoading(false);
    }
    */
  };

  useEffect(() => {
    if (projectContext?.details.docs && projectContext.details.docs.length > 0) {
      //console.log('Using cached documentation:', project.docs[0].content);
      setSections(splitIntoSections(projectContext.details.docs[0].content));
    } else {
      fetchDocumentation();
    }
  }, [/*docsPrompt,*/ projectContext]);

  const formatContent = (content: string) => {
    // Remove all '#' symbols
    let formattedContent = content.replace(/#/g, '');

    // Convert **text** to <span class="font-semibold">text</span> and ensure new lines
    formattedContent = formattedContent.replace(
      /\*\*(.*?)\*\*/g,
      '<div class="file-item"><span class="font-semibold">$1</span>'
    );

    // Ensure the rest of the line is in the same div
    formattedContent = formattedContent.replace(/(\. )/g, '</div>');

    // Format file structure as a file tree
    formattedContent = formattedContent
      .replace(/project\/\n/g, 'project/<br/>')
      .replace(/- /g, '<br/>&nbsp;&nbsp;')
      .replace(/: /g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      .replace(/programs/g, '&nbsp;&nbsp;programs')
      .replace(/token_management/g, '&nbsp;&nbsp;&nbsp;&nbsp;token_management')
      .replace(/state\.rs/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state.rs')
      .replace(/instructions/g, '&nbsp;&nbsp;&nbsp;&nbsp;instructions')
      .replace(
        /mint_tokens\.rs/g,
        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mint_tokens.rs'
      )
      .replace(/mod\.rs/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mod.rs')
      .replace(/tests/g, '&nbsp;&nbsp;tests')
      .replace(
        /token_management\.ts/g,
        '&nbsp;&nbsp;&nbsp;&nbsp;token_management.ts'
      )
      .replace(/ts-sdk/g, '&nbsp;&nbsp;ts-sdk')
      .replace(/index\.ts/g, '&nbsp;&nbsp;&nbsp;&nbsp;index.ts');

    return formattedContent;
  };

  const splitIntoSections = (doc: string) => {
    const sectionTitles = [
      'Overview',
      'File Structure',
      'On-Chain Data',
      'Test Script',
      'Key Actions & Interactions',
      'Error Handling and Debugging',
      'Tokenomics & Asset Management',
      'Security & Best Practices',
      'Installation & Deployment',
    ];

    const sections: Record<string, string> = {};
    sectionTitles.forEach((title, index) => {
      const nextTitle = sectionTitles[index + 1];
      const regex = new RegExp(
        `${index + 1}\\. ${title}(.*?)${
          nextTitle ? `${index + 2}\\. ${nextTitle}` : '$'
        }`,
        's'
      );
      const match = doc.match(regex);
      if (match) {
        sections[title] = formatContent(match[1].trim());
      }
    });

    // console.log('Split sections:', sections);
    return sections;
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sectionList = [
    { title: 'Overview', icon: FaRegFileAlt },
    { title: 'File Structure', icon: TbListTree },
    { title: 'On-Chain Data', icon: PiShareNetwork },
    { title: 'Tests', icon: GrTest },
    { title: 'Key Actions & Interactions', icon: GoZap },
    { title: 'Error Handling and Debugging', icon: MdErrorOutline },
    { title: 'Tokenomics & Asset Management', icon: BsCoin },
    { title: 'Security & Best Practices', icon: MdOutlineSecurity },
    { title: 'Installation & Deployment', icon: IoRocketOutline },
  ];

  return (
    <Box className='flex h-screen bg-gray-100'>
      <Box
        as="aside"
        w="72"
        bg="white"
        shadow="lg"
        position="relative"
        h="full"
        display={{ base: "none", lg: "block" }} // Always visible on large screens
      >
        <Box className='flex h-16 items-center justify-between px-4'>
          <Text className='text-xl font-bold'>Documentation</Text>
          <Button onClick={toggleSidebar} display={{ base: "block", lg: "none" }} variant="ghost">
            {/* Button content goes here */}
          </Button>
        </Box>
        <Box as="nav" className='mt-4'>
          {sectionList.map(({ title, icon: Icon }) => (
            <Button
              key={title}
              onClick={() => setSelectedSection(title)}
              width="full"
              display="flex"
              alignItems="center"
              justifyContent="left"
              px={4}
              py={7}
              textAlign="left"
              fontSize="sm"
              borderBottomWidth="1px"
              borderBottomColor="gray.200"
              bg={selectedSection === title ? "blue.200" : "transparent"}
              color={selectedSection === title ? "blue.800" : "inherit"}
              fontWeight={selectedSection === title ? "semibold" : "normal"}
              _hover={{ bg: "gray.100" }}
              variant="ghost"
            >
              <Icon className='h-5 w-5 mr-2' />
              {title}
            </Button>
          ))}
        </Box>
      </Box>

      <Box as="main" flex="1" overflow="auto">
        <Box as="header" display="flex" h="16" alignItems="center" justifyContent="space-between" px={4}>
         <Button onClick={toggleSidebar} display={{ base: "block", lg: "none" }} variant="ghost">
            <Menu >
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              </MenuButton>
            </Menu>
          </Button>
          <Box className='flex-1 flex items-center justify-end space-x-4'>
            <Button
              bg="blue.400"
              color="white"
              _hover={{ bg: "blue.600" }}
              px={4}
              py={2}
              borderRadius="md"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              borderColor="gray.300"
              _hover={{ bg: "gray.100" }}
              px={4}
              py={2}
              borderRadius="md"
            >
              Share
            </Button>
          </Box>
        </Box>
        <Box className='p-6'>
          <Box className='rounded-lg bg-white p-6 shadow'>
            <Text as="h3" className='mb-4 text-xl font-bold'>{selectedSection}</Text>
            <Box
              className='text-gray-600'
              dangerouslySetInnerHTML={{
                __html: sections[selectedSection] || '',
              }}
            />
          </Box>
        </Box>
      </Box>
      <LoadingModal
        isOpen={isLoading}
        onClose={() => {
          setIsLoading(false);
        }}
      />
    </Box>
  );
};

export default DocPage;