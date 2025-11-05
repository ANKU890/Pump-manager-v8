import React, { useState, useEffect, useMemo } from 'react';
import type { Settings } from '../types.ts';
import { FuelType, PaymentMode } from '../types.ts';
import CloseIcon from './icons/CloseIcon.tsx';

// Re-using this component locally
const RadioButtonGroup: React.FC<{
    options: { value: string; label: string }[];
    selectedValue: string | null;
    onChange: (value: string) => void;
    name: string;
}> = ({ options, selectedValue, onChange, name }) => (
    <div className={`grid grid-cols-2 gap-2`}>
        {options.map(({ value, label }) => (
            <button
                key={value}
                type="button"
                name={name}
                onClick={() => onChange(value)}
                className={`p-3 rounded-md text-center font-semibold transition-all duration-200 border-2 ${
                    selectedValue === value
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { fuelType: FuelType; paymentMode: PaymentMode; amount: number }) => void;
  amount: number;
  settings: Settings;
}

const QuickSaleModal: React.FC<QuickSaleModalProps> = ({ isOpen, onClose, onSave, amount, settings }) => {
  const [fuelType, setFuelType] = useState<FuelType>(FuelType.Petrol);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(PaymentMode.Cash);
  const [currentAmount, setCurrentAmount] = useState(amount);

  useEffect(() => {
    if (isOpen) {
      // Reset to defaults when opened
      setFuelType(FuelType.Petrol);
      setPaymentMode(PaymentMode.Cash);
      setCurrentAmount(amount);
    }
  }, [isOpen, amount]);

  const handleSave = () => {
    onSave({ fuelType, paymentMode, amount: currentAmount });
  };
  
  const handleClose = () => {
    onClose();
  };

  const fuelVolume = useMemo(() => {
      const rate = fuelType === FuelType.Petrol ? settings.petrolRate : settings.dieselRate;
      if (!rate) return 0;
      return currentAmount / rate;
  }, [currentAmount, fuelType, settings]);

  if (!isOpen) return null;

  const fuelTypeOptions = [{value: FuelType.Petrol, label: 'Petrol'}, {value: FuelType.Diesel, label: 'Diesel'}];
  const paymentModeOptions = [{value: PaymentMode.Cash, label: 'Cash'}, {value: PaymentMode.Paytm, label: 'Paytm'}];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={handleClose} role="dialog">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm m-4 p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" onClick={(e) => e.stopPropagation()}>
        <style>{`.animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; } @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-bold text-white">Quick Sale: <span className="text-cyan-400">₹{currentAmount.toFixed(2)}</span></h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close quick sale modal"><CloseIcon /></button>
        </div>
        
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50].map(inc => (
                <button key={inc} onClick={() => setCurrentAmount(prev => prev + inc)} className="bg-gray-700 text-white font-semibold py-2 rounded-md hover:bg-cyan-600 transition-colors">+ {inc}</button>
              ))}
              <button onClick={() => setCurrentAmount(amount)} className="bg-gray-700 text-white font-semibold py-2 rounded-md hover:bg-red-600 transition-colors">Reset</button>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Type</label>
                <RadioButtonGroup name="fuelType" options={fuelTypeOptions} selectedValue={fuelType} onChange={(v) => setFuelType(v as FuelType)} />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Payment Mode</label>
                <RadioButtonGroup name="paymentMode" options={paymentModeOptions} selectedValue={paymentMode} onChange={(v) => setPaymentMode(v as PaymentMode)} />
            </div>

            <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 text-center text-md">
                <span className="text-gray-300">Volume: </span>
                <span className="font-bold text-white">{fuelVolume.toFixed(2)} ltr</span>
            </div>
        </div>
        
        <div className="mt-6">
          <button onClick={handleSave} className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500">
            Confirm Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickSaleModal;