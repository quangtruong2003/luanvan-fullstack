import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

const InfoTooltip = ({ title, content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || <Info className="w-4 h-4 text-blue-500 hover:text-blue-600" />}
      </div>
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-xl">
            <div className="relative">
              <button
                onClick={() => setIsVisible(false)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600"
              >
                <X className="w-2 h-2" />
              </button>
              {title && (
                <div className="font-semibold mb-1 pr-4">{title}</div>
              )}
              <div className="text-gray-200">{content}</div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
