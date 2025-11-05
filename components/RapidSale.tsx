import React, { useState } from 'react';
import type { Settings, Transaction } from '../types.ts';
import { FuelType, PaymentMode } from '../types.ts';
import KeypadButton from './KeypadButton.tsx';
import BackspaceIcon from './icons/BackspaceIcon.tsx';
import PetrolIcon from './icons/PetrolIcon.tsx';
import DieselIcon from './icons/DieselIcon.tsx';
import CashIcon from './icons/CashIcon.tsx';
import PaytmIcon from './icons/PaytmIcon.tsx';
import CardIcon from './icons/CardIcon.tsx';

interface RapidSaleProps {
  settings: Settings;
  onSave: (transaction: Omit<Transaction, 'id' | 'timestamp' | 'type' | 'userName' | 'userAvatarUrl'>) => void;
}

const ToggleButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 border-2 ${
      isActive
        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
        : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600 hover:border-gray-500'
    }`}
  >
    {children}
  </button>
);

const RapidSale: React.FC<RapidSaleProps> = ({ settings, onSave }) => {
  const [amount, setAmount] = useState('0');
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Petrol);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.Cash);
  const [error, setError] = useState<string | null>(null);

  const handleKeypad = (value: string) => {
    setError(null);
    if (value === 'backspace') {
      setAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (value === 'C') {
      setAmount('0');
    } else if (value === '.' && amount.includes('.')) {
      return;
    } else {
      setAmount(prev => (prev === '0' && value !== '.' ? value : prev + value));
    }
  };

  const handleShortcut = (value: string) => {
    setError(null);
    setAmount(value);
  };
  
  const handleRecordSale = () => {
      const saleAmount = parseFloat(amount);
      if (isNaN(saleAmount) || saleAmount <= 0) {
          setError('Invalid Amount');
          return;
      }
      
      const rate = fuelType === FuelType.Petrol ? settings.petrolRate : settings.dieselRate;
      const fuelVolume = rate > 0 ? saleAmount / rate : 0;
      
      const newTransaction = {
          fuelAmount: saleAmount,
          fuelType,
          fuelVolume,
          paymentMode,
          amountPaid: saleAmount,
      };

      onSave(newTransaction);
      setAmount('0'); // Reset for next sale
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-2xl p-4 sm:p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Side: Input & Toggles */}
        <div className="space-y-4">
          {/* Display */}
          <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 text-right">
            <p className="text-gray-400 text-sm">Amount</p>
            <p className="text-4xl font-bold text-white truncate">
                <span className="text-2xl align-top mr-1">₹</span>
                {amount}
            </p>
          </div>

          {/* Shortcuts */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleShortcut('100')} className="bg-gray-700 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">₹100</button>
            <button onClick={() => handleShortcut('200')} className="bg-gray-700 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">₹200</button>
            <button onClick={() => handleShortcut('500')} className="bg-gray-700 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors">₹500</button>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400 text-center">Fuel</p>
                 <div className="grid grid-cols-2 gap-2">
                    <ToggleButton isActive={fuelType === FuelType.Petrol} onClick={() => setFuelType(FuelType.Petrol)}>
                        <PetrolIcon /> <span className="text-xs mt-1">Petrol</span>
                    </ToggleButton>
                    <ToggleButton isActive={fuelType === FuelType.Diesel} onClick={() => setFuelType(FuelType.Diesel)}>
                        <DieselIcon /> <span className="text-xs mt-1">Diesel</span>
                    </ToggleButton>
                </div>
            </div>
             <div className="space-y-2">
                <p className="text-sm font-medium text-gray-400 text-center">Payment</p>
                 <div className="grid grid-cols-3 gap-2">
                    <ToggleButton isActive={paymentMode === PaymentMode.Cash} onClick={() => setPaymentMode(PaymentMode.Cash)}>
                        <CashIcon /> <span className="text-xs mt-1">Cash</span>
                    </ToggleButton>
                    <ToggleButton isActive={paymentMode === PaymentMode.Paytm} onClick={() => setPaymentMode(PaymentMode.Paytm)}>
                        <PaytmIcon /> <span className="text-xs mt-1">Paytm</span>
                    </ToggleButton>
                    <ToggleButton isActive={paymentMode === PaymentMode.Card} onClick={() => setPaymentMode(PaymentMode.Card)}>
                        <CardIcon /> <span className="text-xs mt-1">Card</span>
                    </ToggleButton>
                </div>
            </div>
          </div>

        </div>

        {/* Right Side: Keypad */}
        <div className="grid grid-cols-3 gap-2">
            <KeypadButton value="7" onClick={handleKeypad} />
            <KeypadButton value="8" onClick={handleKeypad} />
            <KeypadButton value="9" onClick={handleKeypad} />
            <KeypadButton value="4" onClick={handleKeypad} />
            <KeypadButton value="5" onClick={handleKeypad} />
            <KeypadButton value="6" onClick={handleKeypad} />
            <KeypadButton value="1" onClick={handleKeypad} />
            <KeypadButton value="2" onClick={handleKeypad} />
            <KeypadButton value="3" onClick={handleKeypad} />
            <KeypadButton value="." onClick={handleKeypad} />
            <KeypadButton value="0" onClick={handleKeypad} />
            <KeypadButton value="backspace" onClick={handleKeypad}><BackspaceIcon /></KeypadButton>
            <KeypadButton value="C" onClick={handleKeypad} className="bg-red-500/50 hover:bg-red-500" />
            <button onClick={handleRecordSale} className="col-span-2 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors duration-200">
                Record Sale
            </button>
        </div>
      </div>
      {error && <p className="text-red-400 text-center text-sm mt-3">{error}</p>}
    </div>
  );
};

export default RapidSale;
