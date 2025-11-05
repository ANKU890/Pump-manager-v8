import React from 'react';

interface KeypadButtonProps {
  onClick: (value: string) => void;
  value: string;
  children?: React.ReactNode;
  className?: string;
  span?: 'col-span-1' | 'col-span-2';
}

const KeypadButton: React.FC<KeypadButtonProps> = ({
  onClick,
  value,
  children,
  className = '',
  span = 'col-span-1',
}) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center justify-center text-xl font-semibold bg-gray-700 text-white rounded-lg h-16 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-all duration-200 transform hover:scale-105 ${span} ${className}`}
    >
      {children || value}
    </button>
  );
};

export default KeypadButton;
