
import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-left flex justify-between items-center text-white focus:ring-2 focus:ring-cyan-500"
      >
        <span className="capitalize">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDownIcon isOpen={isOpen} /> 
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map(option => (
            <div 
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-2 hover:bg-cyan-600 cursor-pointer text-white"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
