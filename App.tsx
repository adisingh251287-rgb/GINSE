import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PreviewModal } from './components/PreviewModal';
import type { ChatMessage, AppArchitecture, Microservice } from './types';
import { MessageType } from './types';
import { initializeAi, generateInitialArchitecture, generateBackendCode, analyzeAndRefactorCode, generateFrontendPreview, generateAppPreview } from './services/geminiService';
import { INITIAL_CHAT_MESSAGES } from './constants';

export default function App() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // State for the Preview Modal
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ name: string; htmlContent: string | null; isLoading: boolean; }>({
    name: '',
    htmlContent: null,
    isLoading: false,
  });


  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini-api-key');
    if (storedKey) {
      handleApiKeySubmit(storedKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    try {
      initializeAi(key);
      sessionStorage.setItem('gemini-api-key', key);
      setApiKey(key);
    } catch (error) {
      console.error("Failed to initialize AI Service:", error);
      alert("Failed to initialize with that API Key. Please check the key and try again.");
    }
  };


  const addMessage = (message: Omit<ChatMessage, 'timestamp'>) => {
    setChatHistory(prev => [...prev, { ...message, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]);
  };

  const handleSendMessage = useCallback(async (message: string) => {
    if (!apiKey) {
      addMessage({ author: 'ai', type: MessageType.TEXT, content: "Please set your API key before we begin." });
      return;
    }
    addMessage({ author: 'user', type: MessageType.TEXT, content: message });
    setIsLoading(true);

    try {
      const newArch = await generateInitialArchitecture(message);
      
      addMessage({
        author: 'ai',
        type: MessageType.TEXT,
        content: `Excellent. I've analyzed your vision for "${newArch.name}" and generated the initial architecture. I'll also start scaffolding the backend server code for you.`
      });

      addMessage({
        author: 'ai',
        type: MessageType.ARCHITECTURE,
        content: "Here is the interactive architecture diagram:",
        architecture: newArch,
      });

      const backendCode = await generateBackendCode(newArch);
      addMessage({
        author: 'ai',
        type: MessageType.CODE,
        content: `I've generated the complete Node.js backend for your application. You can inspect the files below.`,
        code: backendCode,
        codeLanguage: 'javascript'
      });

      addMessage({
        author: 'ai',
        type: MessageType.APP_PREVIEW_PROMPT,
        content: "Now that the core components are ready, I can generate a holistic UI preview for the entire application.",
        architecture: newArch,
      });


    } catch (error) {
      console.error("Error during generation pipeline:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addMessage({
        author: 'ai',
        type: MessageType.TEXT,
        content: `I hit a snag. ${errorMessage}. Could you try describing your app again?`
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const handleRefactorRequest = useCallback(async (codeToRefactor: { [key: string]: string }) => {
     if (!apiKey) return;
    addMessage({
      author: 'ai',
      type: MessageType.TEXT,
      content: "Understood. I'm now analyzing the generated code for potential improvements, like adding error handling and validation..."
    });

    setIsLoading(true);

    try {
      const { analysis, refactoredCode } = await analyzeAndRefactorCode(codeToRefactor);
      
      addMessage({
        author: 'ai',
        type: MessageType.REFACTOR_ANALYSIS,
        content: analysis,
        code: refactoredCode,
        codeLanguage: 'javascript'
      });

    } catch (error) {
      console.error("Error during refactoring pipeline:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addMessage({
        author: 'ai',
        type: MessageType.TEXT,
        content: `I encountered an issue while trying to refactor the code. ${errorMessage}.`
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);
  
  const handleGeneratePreviewRequest = useCallback(async (service: Microservice) => {
    setPreviewData({ name: service.name, isLoading: true, htmlContent: null });
    setPreviewModalOpen(true);
    try {
        const previewHtml = await generateFrontendPreview(service);
        setPreviewData({ name: service.name, isLoading: false, htmlContent: previewHtml });
    } catch (error) {
        console.error("Failed to generate preview:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        const errorHtml = `<div class="p-8 text-center text-red-400"><h2 class="text-xl font-bold mb-2">Preview Generation Failed</h2><p>${errorMessage}</p></div>`;
        setPreviewData({ name: service.name, isLoading: false, htmlContent: errorHtml });
    }
  }, []);

  const handleGenerateAppPreviewRequest = useCallback(async (architecture: AppArchitecture) => {
    setPreviewData({ name: `${architecture.name} (App Preview)`, isLoading: true, htmlContent: null });
    setPreviewModalOpen(true);
    try {
        const previewHtml = await generateAppPreview(architecture);
        setPreviewData({ name: `${architecture.name} (App Preview)`, isLoading: false, htmlContent: previewHtml });
    } catch (error) {
        console.error("Failed to generate app preview:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        const errorHtml = `<div class="p-8 text-center text-red-400"><h2 class="text-xl font-bold mb-2">App Preview Generation Failed</h2><p>${errorMessage}</p></div>`;
        setPreviewData({ name: `${architecture.name} (App Preview)`, isLoading: false, htmlContent: errorHtml });
    }
  }, []);

  if (!apiKey) {
    return <ApiKeyModal onSubmit={handleApiKeySubmit} />;
  }

  return (
    <>
      <div className="h-screen w-screen font-sans flex flex-col max-w-4xl mx-auto bg-bunker-950/10 shadow-2xl">
        <ChatPanel 
          history={chatHistory} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading}
          onRefactorRequest={handleRefactorRequest}
          onGeneratePreview={handleGeneratePreviewRequest}
          onGenerateAppPreview={handleGenerateAppPreviewRequest}
        />
      </div>
      <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          serviceName={previewData.name}
          htmlContent={previewData.htmlContent}
          isLoading={previewData.isLoading}
      />
    </>
  );
}
