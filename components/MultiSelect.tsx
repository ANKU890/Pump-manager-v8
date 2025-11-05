
import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: SelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

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
    const newSelectedValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newSelectedValues);
  };

  const displayLabel = selectedValues.length > 0
    ? selectedValues.map(val => options.find(opt => opt.value === val)?.label).join(', ')
    : placeholder;

  return (
    <div className="relative" ref={selectRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-left flex justify-between items-center text-white focus:ring-2 focus:ring-cyan-500"
      >
        <span className="capitalize truncate">{displayLabel}</span>
        <ChevronDownIcon isOpen={isOpen} /> 
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map(option => (
            <div 
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-2 hover:bg-cyan-600 cursor-pointer text-white flex items-center"
            >
              <input
                type="checkbox"
                readOnly
                checked={selectedValues.includes(option.value)}
                className="mr-2 h-4 w-4 rounded bg-gray-700 border-gray-500 text-cyan-500 focus:ring-cyan-600"
              />
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
