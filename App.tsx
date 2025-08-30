/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { generateImage } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import Toolbar from './components/Toolbar';
import AdjustmentPanel from './components/AdjustmentPanel';
import FilterPanel from './components/FilterPanel';
import ExpandPanel from './components/ExpandPanel';
import { UploadIcon, MagicWandIcon, PaletteIcon, SunIcon } from './components/icons';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

type ActiveTool = 'magic' | 'adjust' | 'filter' | 'advanced';

const App: React.FC = () => {
  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>('magic');

  const currentImageFile = useMemo(() => history[historyIndex], [history, historyIndex]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!currentImageFile) {
        setCurrentImageUrl(null);
        return;
    }
    const objectUrl = URL.createObjectURL(currentImageFile);
    setCurrentImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [currentImageFile]);


  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setError(null);
      setHistory([file]);
      setHistoryIndex(0);
      setActiveTool('magic');
    } else {
      setError('Please select a valid image file.');
    }
  }, []);

  const handleEditApplied = useCallback((newImageFile: File) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImageFile);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleAIGenerate = useCallback(async (editPrompt: string) => {
    if (!currentImageFile) {
      setError('Please upload an image first.');
      return;
    }
    if (!editPrompt.trim()) {
      setError('Please enter a description for your edit.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const editedImageUrl = await generateImage(currentImageFile, editPrompt);
      const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
      handleEditApplied(newImageFile);
      setPrompt('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate the image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentImageFile, handleEditApplied]);

  const handleUploadNew = () => {
    setHistory([]);
    setHistoryIndex(-1);
    setPrompt('');
    setError(null);
  };

  const handleUndo = () => {
    setHistoryIndex(prev => Math.max(0, prev - 1));
  }
  const handleRedo = () => {
    setHistoryIndex(prev => Math.min(history.length - 1, prev + 1));
  }
  const handleReset = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, 1));
      setHistoryIndex(0);
    }
  }

  const handleDownload = () => {
    if (!currentImageUrl) return;
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `pixshop-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const renderUploader = () => (
      <div 
        className={`w-full max-w-2xl mx-auto text-center p-8 transition-all duration-300 rounded-2xl border-2 ${isDraggingOver ? 'bg-blue-500/10 border-dashed border-blue-400' : 'border-gray-700/50 border-dashed'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
          }
        }}
      >
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-100 sm:text-5xl">
            Simple AI Photo Editor
          </h1>
          <p className="max-w-2xl text-lg text-gray-400">
            Upload an image and tell the AI what you want to change.
          </p>

          <div className="mt-6 flex flex-col items-center gap-4">
              <label htmlFor="image-upload" className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full cursor-pointer group hover:bg-blue-500 transition-colors">
                  <UploadIcon className="w-6 h-6 mr-3" />
                  Upload an Image
              </label>
              <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
              <p className="text-sm text-gray-500">or drag and drop a file</p>
          </div>
        </div>
      </div>
  );

  const renderEditor = () => {
    const tools: { id: ActiveTool, name: string, icon: React.ReactNode }[] = [
      { id: 'magic', name: 'Magic Edit', icon: <MagicWandIcon className="w-5 h-5"/> },
      { id: 'adjust', name: 'Adjust', icon: <SunIcon className="w-5 h-5"/> },
      { id: 'filter', name: 'Filter', icon: <PaletteIcon className="w-5 h-5"/> },
      { id: 'advanced', name: 'Advanced', icon: <UploadIcon className="w-5 h-5 -rotate-90"/> },
    ];

    return (
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8 animate-fade-in">
        <div className="w-full lg:w-[calc(100%-24rem)] flex-shrink-0 flex flex-col items-center gap-4">
          <Toolbar onUndo={handleUndo} onRedo={handleRedo} onReset={handleReset} onUploadNew={handleUploadNew} onDownload={handleDownload} canUndo={canUndo} canRedo={canRedo}/>
          <div className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black/20">
            <img
                src={currentImageUrl!}
                alt="User upload"
                className="w-full h-auto object-contain max-h-[70vh] rounded-xl"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-96 flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                {tools.map(tool => (
                    <button key={tool.id} onClick={() => setActiveTool(tool.id)}
                        className={`flex items-center justify-center gap-2 font-semibold p-3 rounded-lg transition-all text-sm ${activeTool === tool.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}>
                        {tool.icon}
                        {tool.name}
                    </button>
                ))}
            </div>

            {activeTool === 'magic' && (
              <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-center text-gray-300">Magic Edit</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleAIGenerate(prompt); }} className="w-full flex flex-col items-center gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'make the sky a vibrant sunset'"
                        className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                        disabled={isLoading || !prompt.trim()}
                    >
                        Generate
                    </button>
                </form>
              </div>
            )}
            {activeTool === 'adjust' && <AdjustmentPanel onApplyAdjustment={handleAIGenerate} isLoading={isLoading} />}
            {activeTool === 'filter' && <FilterPanel onApplyFilter={handleAIGenerate} isLoading={isLoading} />}
            {activeTool === 'advanced' && <ExpandPanel onApplyExpand={handleAIGenerate} onApplyUpscale={handleAIGenerate} isLoading={isLoading} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow w-full max-w-[1600px] mx-auto p-4 md:p-8 flex justify-center items-start">
        {isLoading && (
            <div className="fixed inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Spinner />
                <p className="text-gray-300">AI is working its magic...</p>
            </div>
        )}
        
        {error && (
           <div className="fixed top-28 z-40 text-center animate-fade-in bg-red-500/20 border border-red-500/30 p-4 rounded-lg max-w-md mx-auto flex flex-col items-center gap-3">
            <p className="text-md text-red-300">{error}</p>
            <button
                onClick={() => setError(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-lg text-sm transition-colors"
              >
                Close
            </button>
          </div>
        )}

        {!currentImageUrl ? renderUploader() : renderEditor()}
      </main>
    </div>
  );
};

export default App;