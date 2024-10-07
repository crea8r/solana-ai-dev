import React, { useEffect, useState } from 'react';
import { useGenDocs } from '../hooks/useGenDocs';
import promptAI from '../services/prompt';
import { useProject } from '../contexts/ProjectContext';

const DocPage: React.FC = () => {
  const [sections, setSections] = useState<Record<string, string>>({});
  const docsPrompt = useGenDocs();
  const { project, updateDocs } = useProject();

  const fetchDocumentation = async () => {
    if (docsPrompt) {
      const choices = await promptAI(docsPrompt);
      console.log('Prompt AI response:', choices);
      if (choices && choices.length > 0) {
        const content = choices[0].message?.content || '';
        console.log('Fetched documentation content:', content);
        setSections(splitIntoSections(content));
        updateDocs([{ title: 'Documentation', content, lastUpdated: new Date() }]);
      }
    }
  };

  useEffect(() => {
    if (project?.docs && project.docs.length > 0) {
      console.log('Using cached documentation:', project.docs[0].content);
      setSections(splitIntoSections(project.docs[0].content));
    } else {
      fetchDocumentation();
    }
  }, [docsPrompt, project]);

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
      'Installation & Deployment'
    ];

    const sections: Record<string, string> = {};
    sectionTitles.forEach((title, index) => {
      const nextTitle = sectionTitles[index + 1];
      const regex = new RegExp(`${index + 1}\\. ${title}(.*?)${nextTitle ? `${index + 2}\\. ${nextTitle}` : '$'}`, 's');
      const match = doc.match(regex);
      if (match) {
        sections[title] = match[1].trim();
      }
    });

    console.log('Split sections:', sections);
    return sections;
  };

  const renderFileStructure = (content: string) => {
    return content
      .replace(/#/g, '') // Remove all # symbols
      .split('\n')
      .map((line, index) => (
        <div key={index} className="pl-4">
          {line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>').replace(/-/g, '|')}
        </div>
      ));
  };

  return (
    <div className='flex flex-col h-full w-full items-center'>
      <div className='flex-1'>
        <button
          onClick={fetchDocumentation}
          className='mb-4 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer'
        >
          Refresh Documentation
        </button>
      </div>
      <div className='flex-1 p-6'>
        <h1 className='text-xl font-bold'>Documentation</h1>
        {Object.entries(sections).map(([title, content]) => (
          <div key={title}>
            <h2 className='text-lg font-bold'>{title}</h2>
            <div
              className={`whitespace-pre-wrap mb-4 ${title === 'File Structure' ? 'bg-gray-100 p-4 rounded' : ''}`}
              dangerouslySetInnerHTML={{
                __html: title === 'File Structure' ? renderFileStructure(content).join('') : content,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocPage;
