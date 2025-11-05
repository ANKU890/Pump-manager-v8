import React from 'react';
import type { SalesData } from '../types.ts';
import PetrolIcon from './icons/PetrolIcon.tsx';
import DieselIcon from './icons/DieselIcon.tsx';
import CashIcon from './icons/CashIcon.tsx';
import TransactionIcon from './icons/TransactionIcon.tsx';
import StatItem from './StatItem.tsx';


const SalesCard: React.FC<{ data: SalesData; onClick: () => void; }> = ({ data, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
    >
      <div className="p-6 flex items-center space-x-4 bg-gray-800 border-b border-gray-700">
        <img src={data.avatarUrl} alt={data.name} className="w-16 h-16 rounded-full border-2 border-cyan-400" />
        <h2 className="text-2xl font-bold text-white">{data.name}</h2>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <StatItem icon={<PetrolIcon />} label="Petrol Sold" value={data.petrol.toFixed(2)} unit="ltr" />
        <StatItem icon={<DieselIcon />} label="Diesel Sold" value={data.diesel.toFixed(2)} unit="ltr" />
        <StatItem icon={<CashIcon />} label="Cash in hand" value={`₹${data.cash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <StatItem icon={<TransactionIcon />} label="Transactions" value={data.transactions} />
      </div>
    </button>
  );
};

export default SalesCard;