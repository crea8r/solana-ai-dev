import React, { useEffect, useState } from 'react';
import { useGenDocs } from '../hooks/useGenDocs';
import promptAI from '../services/prompt';
import { useProject } from '../contexts/ProjectContext';
import {
  ChevronLeft,
  Menu,
  FileText,
  Database,
  Code,
  Zap,
  AlertTriangle,
  Coins,
  Shield,
  Download,
} from 'lucide-react';
import LoadingModal from '../components/LoadingModal';
import { useDocs } from '../contexts/DocsContext';

const DocPage: React.FC = () => {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [selectedSection, setSelectedSection] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const docsPrompt = useGenDocs();
  const { docs, updateDocs } = useDocs();
  const { project, updateProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocumentation = async () => {
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
        updateProject({ docs: newDocs });
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (project?.docs && project.docs.length > 0) {
      //console.log('Using cached documentation:', project.docs[0].content);
      setSections(splitIntoSections(project.docs[0].content));
    } else {
      fetchDocumentation();
    }
  }, [docsPrompt, project]);

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
    { title: 'Overview', icon: FileText },
    { title: 'File Structure', icon: FileText },
    { title: 'On-Chain Data', icon: Database },
    { title: 'Test Script', icon: Code },
    { title: 'Key Actions & Interactions', icon: Zap },
    { title: 'Error Handling and Debugging', icon: AlertTriangle },
    { title: 'Tokenomics & Asset Management', icon: Coins },
    { title: 'Security & Best Practices', icon: Shield },
    { title: 'Installation & Deployment', icon: Download },
  ];

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <div className='flex h-16 items-center justify-between px-4'>
          <h1 className='text-xl font-bold'>Documentation</h1>
          <button onClick={toggleSidebar} className='lg:hidden'>
            <ChevronLeft className='h-6 w-6' />
          </button>
        </div>
        <nav className='mt-4'>
          {sectionList.map(({ title, icon: Icon }) => (
            <button
              key={title}
              onClick={() => setSelectedSection(title)}
              className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 ${
                selectedSection === title
                  ? 'bg-blue-200 text-blue-800 font-semibold'
                  : ''
              }`}
            >
              <Icon className='h-5 w-5 mr-2' />
              {title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className='flex-1 overflow-auto'>
        <header className='flex h-16 items-center justify-between bg-white px-4 shadow-sm'>
          <button onClick={toggleSidebar} className='lg:hidden'>
            <Menu className='h-6 w-6' />
          </button>
          <div className='flex-1 flex items-center justify-end space-x-4'>
            <button className='rounded bg-blue-400 px-4 py-2 text-white hover:bg-blue-600'>
              Edit
            </button>
            <button className='rounded border border-gray-300 px-4 py-2 hover:bg-gray-100'>
              Share
            </button>
          </div>
        </header>
        <div className='p-6'>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-4 text-xl font-bold'>{selectedSection}</h3>
            <div
              className='text-gray-600'
              dangerouslySetInnerHTML={{
                __html: sections[selectedSection] || '',
              }}
            />
          </div>
        </div>
      </main>
      <LoadingModal
        isOpen={isLoading}
        onClose={() => {
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default DocPage;
