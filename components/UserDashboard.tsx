import React, { useState, useEffect, useMemo } from 'react';
import type { SalesData, Settings, Transaction, Owner, DailyReadings } from '../types.ts';
import { TransactionType } from '../types.ts';
import BackArrowIcon from './icons/BackArrowIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import TransactionModal from './TransactionModal.tsx';
import TransactionHistory from './TransactionHistory.tsx';
import DepositModal from './DepositModal.tsx';
import DepositIcon from './icons/DepositIcon.tsx';
import SalesCalculator from './SalesCalculator.tsx';
import CalculatorIcon from './icons/CalculatorIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import RapidSale from './RapidSale.tsx';
import GasPumpIcon from './icons/GasPumpIcon.tsx';

interface UserDashboardProps {
  user: SalesData;
  onBack: () => void;
  settings: Settings;
  owners: Owner[];
  userTransactions: Transaction[];
  userReadings: DailyReadings;
  onSaveTransaction: (transaction: Transaction, isEditing: boolean) => void;
  onSaveDeposit: (amount: number) => void;
  onReadingChange: (field: keyof DailyReadings, value: string) => void;
  onUpdateOwner: (owner: Owner) => Promise<void>;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
    user, onBack, settings, owners, 
    userTransactions, userReadings, onSaveTransaction, onSaveDeposit, onReadingChange,
    onUpdateOwner
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveTransactionLocal = (transactionToSave: Transaction, isEditing: boolean) => {
    onSaveTransaction(transactionToSave, isEditing);
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };
  
  const handleSaveRapidSale = (saleDetails: Omit<Transaction, 'id' | 'timestamp' | 'type' | 'userName' | 'userAvatarUrl'>) => {
    const newTransaction: Transaction = {
        id: '', // Will be set by Firestore
        timestamp: new Date().toISOString(),
        type: TransactionType.Sale,
        ...saleDetails,
        userName: user.name,
        userAvatarUrl: user.avatarUrl,
    };
    onSaveTransaction(newTransaction, false);
  };

  const handleSaveDepositLocal = (depositAmount: number) => {
    onSaveDeposit(depositAmount);
    setIsDepositModalOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (transaction.type === TransactionType.Sale) {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const openDetailedSaleModal = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });
  };

  const transactionsToday = useMemo(() => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    return userTransactions.filter(tx => tx.timestamp.startsWith(todayDateStr));
  }, [userTransactions]);
  
  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <header className="relative flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700 shadow-lg">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200" 
          aria-label="Go back"
        >
          <BackArrowIcon />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-cyan-400 tracking-wider">
          {user.name}'s Dashboard
        </h1>
        <div className="w-10 h-10"></div>
      </header>
      <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <div className="text-center mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-lg text-gray-300">{formatDateTime(currentTime)}</p>
        </div>
        
        <RapidSale settings={settings} onSave={handleSaveRapidSale} />

        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
             <button
                onClick={openDetailedSaleModal}
                className="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-200"
            >
                <PlusIcon />
                <span className="ml-2">Detailed Sale</span>
            </button>
            <button
                onClick={openDetailedSaleModal}
                className="w-full flex items-center justify-center bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-colors duration-200"
            >
                <GasPumpIcon />
                <span className="ml-2">Full Tank</span>
            </button>
            <button
                onClick={() => setIsDepositModalOpen(true)}
                className="w-full flex items-center justify-center bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors duration-200"
            >
                <DepositIcon />
                <span className="ml-2">Deposit Cash</span>
            </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-2xl mb-8">
            <button
                className="w-full flex justify-between items-center p-6 text-left"
                onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                aria-expanded={isCalculatorOpen}
            >
                <div className="flex items-center">
                    <CalculatorIcon />
                    <h3 className="text-lg font-bold text-white ml-3">Sales Reconciliation</h3>
                </div>
                <ChevronDownIcon isOpen={isCalculatorOpen} />
            </button>
            {isCalculatorOpen && (
                <div className="px-6 pb-6">
                    <div className="border-t border-gray-700 pt-6">
                        <SalesCalculator
                            readings={userReadings}
                            onReadingChange={onReadingChange}
                            settings={settings}
                            transactionsToday={transactionsToday}
                        />
                    </div>
                </div>
            )}
        </div>

        <TransactionHistory transactions={userTransactions} onEdit={handleEditTransaction} />
      </main>
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransactionLocal}
        settings={settings}
        owners={owners}
        onUpdateOwner={onUpdateOwner}
        transactionToEdit={editingTransaction}
      />
      <DepositModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSave={handleSaveDepositLocal}
      />
    </div>
  );
};

export default UserDashboard;
