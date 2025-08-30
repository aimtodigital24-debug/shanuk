/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UndoIcon, RedoIcon, UploadIcon, DownloadIcon } from './icons';

const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5v1.5m-3.375 0h4.992" />
    </svg>
);

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onUploadNew: () => void;
  onDownload: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode, label: string }> = ({ onClick, disabled, children, label }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className="flex items-center gap-2 bg-gray-700/50 text-gray-200 font-semibold py-2 px-4 rounded-md transition-all duration-200 ease-in-out hover:enabled:bg-gray-600/80 active:enabled:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
    >
        {children}
        <span className="hidden sm:inline">{label}</span>
    </button>
);


const Toolbar: React.FC<ToolbarProps> = ({ onUndo, onRedo, onReset, onUploadNew, onDownload, canUndo, canRedo }) => {
    return (
        <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-2 flex items-center justify-center gap-2 backdrop-blur-sm">
            <ToolButton onClick={onUndo} disabled={!canUndo} label="Undo">
                <UndoIcon className="w-5 h-5" />
            </ToolButton>
            <ToolButton onClick={onRedo} disabled={!canRedo} label="Redo">
                <RedoIcon className="w-5 h-5" />
            </ToolButton>
            <div className="h-6 w-px bg-gray-600 mx-2"></div>
            <ToolButton onClick={onReset} disabled={!canUndo} label="Reset Edits">
                <ResetIcon className="w-5 h-5" />
            </ToolButton>
            <ToolButton onClick={onUploadNew} disabled={false} label="New Image">
                <UploadIcon className="w-5 h-5" />
            </ToolButton>
             <ToolButton onClick={onDownload} disabled={false} label="Download">
                <DownloadIcon className="w-5 h-5" />
            </ToolButton>
        </div>
    );
};

export default Toolbar;