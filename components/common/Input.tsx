
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`block w-full bg-slate-700 border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 ${className}`}
        {...props}
      />
    </div>
  );
};
