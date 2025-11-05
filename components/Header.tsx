
import React from 'react';
import SettingsIcon from './icons/SettingsIcon.tsx';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="relative flex items-center justify-center p-4 bg-gray-900 border-b border-gray-700 shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-wider">
        Pump Manager
      </h1>
      <div className="absolute right-4 sm:right-6">
        <button 
          onClick={onSettingsClick}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200" 
          aria-label="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
