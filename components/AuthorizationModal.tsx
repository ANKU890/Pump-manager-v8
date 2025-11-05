
import React, { useState, useEffect } from 'react';
import CloseIcon from './icons/CloseIcon.tsx';

interface AuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
}

const PASSCODE = "696969";

const AuthorizationModal: React.FC<AuthorizationModalProps> = ({ isOpen, onClose, onSuccess, title }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (passcode === PASSCODE) {
      onSuccess();
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex justify-center items-center z-[60] p-4" onClick={onClose} role="dialog">
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm m-4 p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`.animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; } @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close authorization"><CloseIcon /></button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-400">This is a sensitive action and requires authorization. Please enter the passcode to proceed.</p>
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-400 mb-1">Passcode</label>
            <input 
              type="password" 
              id="passcode" 
              value={passcode} 
              onChange={(e) => setPasscode(e.target.value)} 
              onKeyPress={handleKeyPress}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 tracking-widest text-center" 
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

        <div className="mt-6">
          <button 
            onClick={handleConfirm} 
            className="w-full bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationModal;
