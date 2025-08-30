/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ExpandPanelProps {
  onApplyExpand: (prompt: string) => void;
  onApplyUpscale: (prompt: string) => void;
  isLoading: boolean;
}

const ExpandPanel: React.FC<ExpandPanelProps> = ({ onApplyExpand, onApplyUpscale, isLoading }) => {
  const expandPrompts = {
    horizontal: 'Expand the image horizontally, filling in the new areas on the left and right sides with content that seamlessly and realistically extends the original scene. Do not change the original content of the image.',
    vertical: 'Expand the image vertically, filling in the new areas on the top and bottom with content that seamlessly and realistically extends the original scene. Do not change the original content of the image.',
    all: 'Expand the image on all four sides, filling in the new areas with content that seamlessly and realistically extends the original scene. Do not change the original content of the image.',
  };

  const upscalePrompt = 'Upscale this image to a higher resolution, significantly enhancing details, sharpness, and overall clarity. The result should be a photorealistic version of the original image, free of artifacts.';

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-center text-gray-300">Advanced Tools</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upscale Section */}
        <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col items-center text-center">
            <h4 className="font-semibold text-gray-200">Upscale Image</h4>
            <p className="text-sm text-gray-400 mt-1 mb-3">Enhance resolution and clarity for a sharper, more detailed image.</p>
            <button
                onClick={() => onApplyUpscale(upscalePrompt)}
                disabled={isLoading}
                className="w-full bg-gradient-to-br from-purple-600 to-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-indigo-800 disabled:to-indigo-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
            >
                Apply Upscale
            </button>
        </div>

        {/* Expand Section */}
        <div className="bg-gray-900/50 p-4 rounded-lg flex flex-col items-center text-center">
            <h4 className="font-semibold text-gray-200">Expand Canvas (Outpainting)</h4>
            <p className="text-sm text-gray-400 mt-1 mb-3">Extend the image borders and let AI fill in the new space.</p>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <button
                    onClick={() => onApplyExpand(expandPrompts.horizontal)}
                    disabled={isLoading}
                    className="w-full bg-white/10 text-gray-200 font-semibold py-3 px-2 rounded-md transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ↔ Horizontal
                </button>
                <button
                    onClick={() => onApplyExpand(expandPrompts.vertical)}
                    disabled={isLoading}
                    className="w-full bg-white/10 text-gray-200 font-semibold py-3 px-2 rounded-md transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ↕ Vertical
                </button>
                <button
                    onClick={() => onApplyExpand(expandPrompts.all)}
                    disabled={isLoading}
                    className="w-full bg-white/10 text-gray-200 font-semibold py-3 px-2 rounded-md transition-colors hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ⤧ All Sides
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandPanel;