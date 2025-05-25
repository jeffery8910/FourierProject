
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';

interface TooltipIconProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const TOOLTIP_MARGIN = 8; // 8px margin from viewport edges and trigger

export const TooltipIcon: React.FC<TooltipIconProps> = ({ text, position = 'top', align = 'center', className = '' }) => {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({
    opacity: 0,
    pointerEvents: 'none',
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    transition: 'opacity 0.15s ease-in-out',
  });

  const calculateAndSetStyles = useCallback(() => {
    if (visible && buttonRef.current && tooltipRef.current) {
      const triggerRect = buttonRef.current.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;

      // Temporarily make it measurable without being seen or affecting layout much
      tooltipEl.style.visibility = 'hidden';
      tooltipEl.style.position = 'fixed'; // Ensure it's measured based on fixed positioning
      tooltipEl.style.top = '-9999px';
      tooltipEl.style.left = '-9999px';
      
      // Force repaint/reflow if necessary, though usually direct offsetWidth/Height is fine
      // requestAnimationFrame might be overkill here if it makes it async in a bad way
      const tooltipHeight = tooltipEl.offsetHeight;
      const tooltipWidth = tooltipEl.offsetWidth;
      
      // Restore visibility for actual positioning calculation
      tooltipEl.style.visibility = ''; 
      // position will be set by dynamicStyles


      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newCalculatedStyles: React.CSSProperties = {
        position: 'fixed',
        opacity: 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.15s ease-in-out', // ensure transition is maintained
        maxWidth: '20rem', // Corresponds to max-w-xs for consistency
      };

      let idealTop: number;
      let idealLeft: number;

      // Calculate Ideal Vertical Position
      if (position === 'top') {
        idealTop = triggerRect.top - tooltipHeight - TOOLTIP_MARGIN;
      } else if (position === 'bottom') {
        idealTop = triggerRect.bottom + TOOLTIP_MARGIN;
      } else { // left or right
        idealTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      }

      // Calculate Ideal Horizontal Position
      if (position === 'top' || position === 'bottom') {
        if (align === 'start') {
          idealLeft = triggerRect.left;
        } else if (align === 'end') {
          idealLeft = triggerRect.right - tooltipWidth;
        } else { // center
          idealLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        }
      } else if (position === 'left') {
        idealLeft = triggerRect.left - tooltipWidth - TOOLTIP_MARGIN;
      } else { // right
        idealLeft = triggerRect.right + TOOLTIP_MARGIN;
      }

      // Vertical Collision Detection & Correction
      if (position === 'top' && idealTop < TOOLTIP_MARGIN) {
        idealTop = triggerRect.bottom + TOOLTIP_MARGIN; // Flip to bottom
      } else if (position === 'bottom' && idealTop + tooltipHeight > viewportHeight - TOOLTIP_MARGIN) {
        idealTop = triggerRect.top - tooltipHeight - TOOLTIP_MARGIN; // Flip to top
      }
      
      // Pin to viewport if still out of bounds vertically after potential flip or for left/right
      if (idealTop < TOOLTIP_MARGIN) {
        idealTop = TOOLTIP_MARGIN;
      } else if (idealTop + tooltipHeight > viewportHeight - TOOLTIP_MARGIN) {
        idealTop = viewportHeight - tooltipHeight - TOOLTIP_MARGIN;
      }
      
      newCalculatedStyles.top = `${idealTop}px`;

      // Horizontal Collision Detection & Correction
      if (position === 'left' && idealLeft < TOOLTIP_MARGIN) {
          idealLeft = triggerRect.right + TOOLTIP_MARGIN; // Flip to right
      } else if (position === 'right' && idealLeft + tooltipWidth > viewportWidth - TOOLTIP_MARGIN) {
          idealLeft = triggerRect.left - tooltipWidth - TOOLTIP_MARGIN; // Flip to left
      }

      // Pin to viewport if still out of bounds horizontally (especially for top/bottom aligned tooltips)
      if (idealLeft < TOOLTIP_MARGIN) {
        idealLeft = TOOLTIP_MARGIN;
      } else if (idealLeft + tooltipWidth > viewportWidth - TOOLTIP_MARGIN) {
        idealLeft = viewportWidth - tooltipWidth - TOOLTIP_MARGIN;
      }
      
      newCalculatedStyles.left = `${idealLeft}px`;
      
      setDynamicStyles(newCalculatedStyles);

    } else {
      setDynamicStyles({
        opacity: 0,
        pointerEvents: 'none',
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        transition: 'opacity 0.15s ease-in-out',
      });
    }
  }, [visible, text, position, align]); // text dependency in case content size changes

  useEffect(() => {
    if (visible) {
      // Using requestAnimationFrame to ensure DOM elements are ready for measurement
      requestAnimationFrame(calculateAndSetStyles);
    } else {
      calculateAndSetStyles(); // To hide it
    }

    const handleResizeOrScroll = () => {
      if (visible) { // Only recalculate if visible
         requestAnimationFrame(calculateAndSetStyles);
      }
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true); // Capture scroll events

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [visible, calculateAndSetStyles]);


  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={buttonRef}
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
      <div
        ref={tooltipRef}
        role="tooltip"
        className="w-max max-w-xs p-2 text-sm text-slate-100 bg-slate-700 rounded-md shadow-lg z-50 border border-slate-600"
        style={dynamicStyles}
      >
        {text}
      </div>
    </div>
  );
};
