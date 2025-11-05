import React, { useMemo } from 'react';
import type { Settings, Transaction, DailyReadings } from '../types.ts';
import { TransactionType } from '../types.ts';

interface SalesCalculatorProps {
  readings: DailyReadings;
  onReadingChange: (field: keyof DailyReadings, value: string) => void;
  settings: Settings;
  transactionsToday: Transaction[];
}

const ReadingInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
            placeholder="0.00"
        />
    </div>
);

const SalesCalculator: React.FC<SalesCalculatorProps> = ({ readings, onReadingChange, settings, transactionsToday }) => {
    
    const { petrolSold, dieselSold, expectedSales, recordedSales, difference } = useMemo(() => {
        const p2pm = parseFloat(readings.petrol2pm) || 0;
        const p10pm = parseFloat(readings.petrol10pm) || 0;
        const d2pm = parseFloat(readings.diesel2pm) || 0;
        const d10pm = parseFloat(readings.diesel10pm) || 0;

        const petrolSold = p10pm > p2pm ? p10pm - p2pm : 0;
        const dieselSold = d10pm > d2pm ? d10pm - d2pm : 0;

        const expectedPetrolSales = petrolSold * settings.petrolRate;
        const expectedDieselSales = dieselSold * settings.dieselRate;
        const expectedSales = expectedPetrolSales + expectedDieselSales;

        const recordedSales = transactionsToday
            .filter(tx => tx.type === TransactionType.Sale)
            .reduce((sum, tx) => sum + tx.fuelAmount, 0);
        
        const difference = recordedSales - expectedSales;

        return { petrolSold, dieselSold, expectedSales, recordedSales, difference };
    }, [readings, settings, transactionsToday]);


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-cyan-400">Petrol Readings (ltr)</h4>
                    <ReadingInput label="2 PM Reading" value={readings.petrol2pm} onChange={(v) => onReadingChange('petrol2pm', v)} />
                    <ReadingInput label="10 PM Reading" value={readings.petrol10pm} onChange={(v) => onReadingChange('petrol10pm', v)} />
                </div>
                <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-cyan-400">Diesel Readings (ltr)</h4>
                    <ReadingInput label="2 PM Reading" value={readings.diesel2pm} onChange={(v) => onReadingChange('diesel2pm', v)} />
                    <ReadingInput label="10 PM Reading" value={readings.diesel10pm} onChange={(v) => onReadingChange('diesel10pm', v)} />
                </div>
            </div>

            {/* Calculations and Summary */}
            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
                <h4 className="text-lg font-semibold text-white mb-2">Daily Summary</h4>
                <div className="flex justify-between items-center text-gray-300">
                    <span>Petrol Sold (calc.):</span>
                    <span className="font-mono text-white">{petrolSold.toFixed(2)} ltr</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                    <span>Diesel Sold (calc.):</span>
                    <span className="font-mono text-white">{dieselSold.toFixed(2)} ltr</span>
                </div>
                 <div className="flex justify-between items-center text-gray-300">
                    <span>Expected Sales (from readings):</span>
                    <span className="font-mono font-semibold text-white">₹{expectedSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                    <span>Recorded Sales (from app):</span>
                    <span className="font-mono font-semibold text-white">₹{recordedSales.toFixed(2)}</span>
                </div>
                 <div className={`flex justify-between items-center text-lg font-bold p-3 rounded-lg mt-2 ${
                    Math.abs(difference) < 0.01 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                 }`}>
                    <span>Difference:</span>
                    <span className="font-mono">{difference.toFixed(2)}</span>
                </div>
            </div>
        </>
    );
};

export default SalesCalculator;