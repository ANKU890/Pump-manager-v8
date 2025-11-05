
import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon.tsx';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    onSave(numericAmount);
    setAmount('');
    setError('');
  };
  
  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={handleClose} role="dialog">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm m-4 p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <style>{`.animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; } @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-bold text-white">Record Cash Deposit</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close deposit modal"><CloseIcon /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-400 mb-1">Deposit Amount (₹)</label>
            <input type="number" id="depositAmount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 2000" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
        <div className="mt-6">
          <button onClick={handleSave} className="w-full bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">
            Confirm Deposit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
