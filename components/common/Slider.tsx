
import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  value: number | string;
  min: number | string;
  max: number | string;
  step?: number | string;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, id, value, min, max, step, unit, className = '', onChange, ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
          {label}: <span className="font-bold text-sky-400">{value}{unit}</span>
        </label>
      )}
      <input
        type="range"
        id={id}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500 ${className}`}
        {...props}
      />
    </div>
  );
};
