import React from 'react';
import type { Transaction } from '../types.ts';
import TransactionItem from './TransactionItem.tsx';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onEdit }) => {
  return (
    <div>
      {transactions.length === 0 ? (
        <div className="text-center py-10 px-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-gray-400">No transactions recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(tx => (
            <TransactionItem key={tx.id} transaction={tx} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;