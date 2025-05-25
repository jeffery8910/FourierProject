
import React, { useState } from 'react';
import { Icon } from './Icon';

interface TooltipIconProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end'; // New prop for horizontal alignment
  className?: string;
}

export const TooltipIcon: React.FC<TooltipIconProps> = ({ text, position = 'top', align = 'center', className = '' }) => {
  const [visible, setVisible] = useState(false);

  const getPositionClasses = () => {
    let alignClass = 'left-1/2 -translate-x-1/2'; // Default for 'center'

    if (position === 'top' || position === 'bottom') {
      if (align === 'start') {
        alignClass = 'left-0';
      } else if (align === 'end') {
        alignClass = 'right-0';
      }
      // If align === 'center', it uses the default alignClass
    }

    switch (position) {
      case 'top': return `bottom-full ${alignClass} mb-2`;
      case 'bottom': return `top-full ${alignClass} mt-2`;
      case 'left': return 'right-full top-1/2 -translate-y-1/2 mr-2'; // Align prop doesn't apply to left/right for now
      case 'right': return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default: return `bottom-full ${alignClass} mb-2`;
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="詳細資訊"
        className="text-slate-400 hover:text-sky-400 focus:outline-none"
      >
        <Icon type="info" className="w-4 h-4" />
      </button>
      {visible && (
        <div
          role="tooltip"
          className={`absolute ${getPositionClasses()} w-max max-w-xs p-2 text-sm text-slate-100 bg-slate-700 rounded-md shadow-lg z-50 border border-slate-600`}
        >
          {text}
        </div>
      )}
    </div>
  );
};