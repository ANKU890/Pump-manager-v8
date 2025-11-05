import React from 'react';
import PetrolIcon from './icons/PetrolIcon.tsx';
import DieselIcon from './icons/DieselIcon.tsx';
import TransactionIcon from './icons/TransactionIcon.tsx';
import PaytmIcon from './icons/PaytmIcon.tsx';
import StatItem from './StatItem.tsx';

interface TotalSummaryCardProps {
  data: {
    totalPetrol: number;
    totalDiesel: number;
    totalTransactions: number;
    totalPaytm: number;
  };
}

const TotalSummaryCard: React.FC<TotalSummaryCardProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6 mb-8">
       <h2 className="text-xl font-bold text-white mb-4 text-center">Total Summary</h2>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem icon={<PetrolIcon />} label="Total Petrol" value={data.totalPetrol.toFixed(2)} unit="ltr" />
        <StatItem icon={<DieselIcon />} label="Total Diesel" value={data.totalDiesel.toFixed(2)} unit="ltr" />
        <StatItem icon={<TransactionIcon />} label="Total Transactions" value={data.totalTransactions} />
        <StatItem icon={<PaytmIcon />} label="Total Paytm" value={`₹${data.totalPaytm.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
       </div>
    </div>
  );
};

export default TotalSummaryCard;