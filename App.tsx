import React from 'react';
import Header from './components/Header.tsx';
import SalesCard from './components/SalesCard.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import UserDashboard from './components/UserDashboard.tsx';
import type { SalesData, Settings, Owner, Transaction, DailyReadings, Attendant } from './types.ts';
import { FuelType, PaymentMode, TransactionType } from './types.ts';
import TransactionHistory from './components/TransactionHistory.tsx';
import FilterIcon from './components/icons/FilterIcon.tsx';
import CustomSelect from './components/CustomSelect.tsx';
import { db, seedInitialData, deleteAllDocsInCollection } from './firebase.ts';
import { collection, doc, onSnapshot, orderBy, query, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import TotalSummaryCard from './components/TotalSummaryCard.tsx';
import MultiSelect from './components/MultiSelect.tsx';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [settings, setSettings] = React.useState<Settings>({
    petrolRate: 0,
    dieselRate: 0,
    advanceCash: 0,
  });
  const [owners, setOwners] = React.useState<Owner[]>([]);
  const [attendants, setAttendants] = React.useState<Attendant[]>([]);
  const [allTransactions, setAllTransactions] = React.useState<Transaction[]>([]);
  const [allReadings, setAllReadings] = React.useState<Record<string, Record<string, DailyReadings>>>({});

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [filterUsers, setFilterUsers] = React.useState<string[]>([]);
  const [filterFuelType, setFilterFuelType] = React.useState<FuelType | 'all'>('all');
  const [filterPaymentModes, setFilterPaymentModes] = React.useState<PaymentMode[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAllTransactions, setShowAllTransactions] = React.useState(false);


  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Listen for settings changes from Firestore
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      } else {
        // If settings don't exist, create them with defaults
        setDoc(doc.ref, { petrolRate: 100, dieselRate: 90, advanceCash: 5000 });
      }
    });
    return () => unsub();
  }, []);

  // Listen for owners changes from Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'owners'), orderBy('name'));
    const unsub = onSnapshot(q, (snapshot) => {
      const ownersData = snapshot.docs.map(doc => {
        const data = doc.data();
        const cleanVehicles = (data.vehicles || []).map((v: any) => ({ ...v }));
        return {
          id: doc.id,
          name: data.name,
          vehicles: cleanVehicles,
        } as Owner;
      });
      setOwners(ownersData);
    });
    return () => unsub();
  }, []);

  // Listen for attendants changes from Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'attendants'), orderBy('name'));
    const unsub = onSnapshot(q, (snapshot) => {
      const attendantsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          avatarUrl: data.avatarUrl,
        } as Attendant;
      });
      setAttendants(attendantsData);
    });
    return () => unsub();
  }, []);

  // Listen for transactions changes from Firestore
  React.useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const newTx: Transaction = {
            id: doc.id,
            timestamp: (data.timestamp && typeof data.timestamp.toDate === 'function')
              ? data.timestamp.toDate().toISOString()
              : data.timestamp,
            type: data.type,
            fuelAmount: data.fuelAmount,
            fuelType: data.fuelType,
            fuelVolume: data.fuelVolume,
            paymentMode: data.paymentMode,
            amountPaid: data.amountPaid,
            changeReturned: data.changeReturned,
            vehicleNumber: data.vehicleNumber,
            vehicleOwner: data.vehicleOwner,
            vehicleType: data.vehicleType,
            userName: data.userName,
            userAvatarUrl: data.userAvatarUrl,
            // Deep copy nested objects to prevent circular reference errors
            paymentDetails: data.paymentDetails ? { ...data.paymentDetails } : undefined,
            cashBack: data.cashBack,
        };
        return newTx;
      });
      setAllTransactions(transactionsData);
    });
    return () => unsub();
  }, []);
  
  // Listen for readings changes for all users from Firestore
  React.useEffect(() => {
    if (attendants.length === 0) return;
    const unsubs = attendants.map(user => {
      const readingsCollectionPath = `readings/${user.name}/days`;
      return onSnapshot(collection(db, readingsCollectionPath), (snapshot) => {
        const userReadings: Record<string, DailyReadings> = {};
        snapshot.docs.forEach(doc => {
            userReadings[doc.id] = doc.data() as DailyReadings;
        });
        setAllReadings(prev => ({
            ...prev,
            [user.name]: userReadings,
        }));
      });
    });
    return () => unsubs.forEach(unsub => unsub());
  }, [attendants]);
  
  const handleUpdateSettings = async (newSettings: Settings) => {
    await setDoc(doc(db, 'settings', 'main'), newSettings);
    setIsModalOpen(false);
  };
  
  const handleAddOwner = async (name: string) => {
    await addDoc(collection(db, 'owners'), { name: name.trim(), vehicles: [] });
  };
  
  const handleDeleteOwner = async (ownerId: string) => {
    try {
      await deleteDoc(doc(db, 'owners', ownerId));
    } catch (error) {
      console.error("Error deleting owner: ", error);
      alert("Failed to delete owner. See console for details.");
    }
  };

  const handleUpdateOwner = async (owner: Owner) => {
    const { id, ...data } = owner;
    await setDoc(doc(db, 'owners', id), data);
  };
  
  const handleAddAttendant = async (name: string) => {
    if (!name.trim()) return;
    const newAttendant = {
      name: name.trim(),
      avatarUrl: `https://picsum.photos/seed/${name.trim().toLowerCase()}/100/100`,
    };
    await addDoc(collection(db, 'attendants'), newAttendant);
  };
  
  const handleDeleteAttendant = async (attendantId: string) => {
    try {
      await deleteDoc(doc(db, 'attendants', attendantId));
    } catch (error) {
      console.error("Error deleting attendant: ", error);
      alert("Failed to delete attendant. See console for details.");
    }
  };

  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  
  const handleSaveTransaction = async (transactionToSave: Transaction, isEditing: boolean) => {
    const { id, ...dataToSave } = transactionToSave;
    if (isEditing && id) { 
      await updateDoc(doc(db, 'transactions', id), dataToSave);
    } else {
      await addDoc(collection(db, 'transactions'), dataToSave);
    }
  };

  const handleSaveDeposit = async (userName: string, depositAmount: number) => {
    const depositTransaction: Omit<Transaction, 'id'> = {
      timestamp: new Date().toISOString(),
      type: TransactionType.Deposit,
      fuelAmount: depositAmount,
      userName: userName,
      userAvatarUrl: attendants.find(u => u.name === userName)?.avatarUrl || '',
    };
    await addDoc(collection(db, 'transactions'), depositTransaction);
  };

  const handleReadingChange = async (userName: string, field: keyof DailyReadings, value: string) => {
    const todayDate = getTodayDateString();
    const docRef = doc(db, `readings/${userName}/days`, todayDate);
    await setDoc(docRef, { [field]: value }, { merge: true });
  };

  const handleEndShift = async () => {
    try {
      await deleteAllDocsInCollection('transactions');
      for (const attendant of attendants) {
        await deleteAllDocsInCollection(`readings/${attendant.name}/days`);
      }
      alert('Shift ended successfully. All transactions and readings have been cleared.');
    } catch (error) {
      console.error("Error ending shift: ", error);
      alert('Failed to end shift. Please check the console for errors.');
    }
  };

  const handleResetAllData = async () => {
    try {
      await handleEndShift(); // Clears transactions and readings
      await deleteAllDocsInCollection('owners');
      await deleteAllDocsInCollection('attendants');
      await seedInitialData();
      alert('Application data has been reset successfully.');
    } catch (error) {
      console.error("Error resetting data: ", error);
      alert('Failed to reset data. Please check the console for errors.');
    }
  };

  const salesData: SalesData[] = React.useMemo(() => {
    return attendants.map(user => {
        const userTransactions = allTransactions.filter(tx => tx.userName === user.name);

        const petrol = userTransactions
            .filter(tx => tx.type === TransactionType.Sale && tx.fuelType === FuelType.Petrol)
            .reduce((acc, tx) => acc + (tx.fuelVolume ?? 0), 0);

        const diesel = userTransactions
            .filter(tx => tx.type === TransactionType.Sale && tx.fuelType === FuelType.Diesel)
            .reduce((acc, tx) => acc + (tx.fuelVolume ?? 0), 0);

        const cashFromSales = userTransactions
            .filter(tx => tx.type === TransactionType.Sale)
            .reduce((acc, tx) => {
                if (tx.paymentMode === PaymentMode.Cash) {
                    return acc + tx.fuelAmount;
                }
                if (tx.paymentMode === PaymentMode.Split && tx.paymentDetails?.cash) {
                    return acc + tx.paymentDetails.cash;
                }
                return acc;
            }, 0);

        const cashDeposited = userTransactions
            .filter(tx => tx.type === TransactionType.Deposit)
            .reduce((acc, tx) => acc + tx.fuelAmount, 0);

        const paytmCashGiven = userTransactions
            .filter(tx => tx.type === TransactionType.PaytmCash)
            .reduce((acc, tx) => acc + tx.fuelAmount, 0);
            
        const cashBackGiven = userTransactions
            .filter(tx => tx.type === TransactionType.Sale && tx.cashBack)
            .reduce((acc, tx) => acc + (tx.cashBack ?? 0), 0);

        const cash = settings.advanceCash + cashFromSales - cashDeposited - paytmCashGiven - cashBackGiven;
        
        const transactions = userTransactions.filter(tx => tx.type === TransactionType.Sale).length;

        return {
            name: user.name,
            avatarUrl: user.avatarUrl,
            petrol,
            diesel,
            cash,
            transactions,
        };
    });
  }, [allTransactions, settings.advanceCash, attendants]);

  const totalSummaryData = React.useMemo(() => {
    const totalPetrol = allTransactions
      .filter(tx => tx.type === TransactionType.Sale && tx.fuelType === FuelType.Petrol)
      .reduce((acc, tx) => acc + (tx.fuelVolume ?? 0), 0);

    const totalDiesel = allTransactions
      .filter(tx => tx.type === TransactionType.Sale && tx.fuelType === FuelType.Diesel)
      .reduce((acc, tx) => acc + (tx.fuelVolume ?? 0), 0);

    const totalTransactions = allTransactions.filter(tx => tx.type === TransactionType.Sale).length;

    const totalPaytm = allTransactions
        .reduce((acc, tx) => {
            if (tx.type === TransactionType.Sale) {
                if (tx.paymentMode === PaymentMode.Paytm && tx.amountPaid) {
                    return acc + tx.amountPaid;
                }
                if (tx.paymentMode === PaymentMode.Split && tx.paymentDetails?.paytm) {
                    return acc + tx.paymentDetails.paytm;
                }
            } else if (tx.type === TransactionType.PaytmCash) {
                return acc + tx.fuelAmount;
            }
            return acc;
        }, 0);

    return { totalPetrol, totalDiesel, totalTransactions, totalPaytm };
  }, [allTransactions]);

  const filteredTransactions = React.useMemo(() => {
    return allTransactions.filter(tx => {
        const userMatch = filterUsers.length === 0 || (tx.userName && filterUsers.includes(tx.userName));
        const fuelTypeMatch = filterFuelType === 'all' || (tx.type === TransactionType.Sale && tx.fuelType === filterFuelType);
        
        let paymentModeMatch = true;
        if (filterPaymentModes.length > 0) {
            if (tx.type === TransactionType.Sale && tx.paymentMode) {
                paymentModeMatch = filterPaymentModes.includes(tx.paymentMode);
            } else if (tx.type === TransactionType.PaytmCash) {
                paymentModeMatch = filterPaymentModes.includes(PaymentMode.Paytm);
            } else {
                paymentModeMatch = false;
            }
        }

        const searchMatch = !searchQuery || 
                            (tx.vehicleNumber && tx.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (tx.vehicleOwner && tx.vehicleOwner.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (filterFuelType !== 'all' && tx.type !== TransactionType.Sale) return false;

        return userMatch && fuelTypeMatch && paymentModeMatch && searchMatch;
    });
  }, [allTransactions, filterUsers, filterFuelType, filterPaymentModes, searchQuery]);

  const transactionsToShow = showAllTransactions ? filteredTransactions : filteredTransactions.slice(0, 3);
  
  const activeFilterCount = [
    filterUsers.length > 0,
    filterFuelType !== 'all',
    filterPaymentModes.length > 0,
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setFilterUsers([]);
    setFilterFuelType('all');
    setFilterPaymentModes([]);
    setSearchQuery('');
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });
  };

  const userOptions = attendants.map(user => ({ value: user.name, label: user.name }));
  
  const fuelTypeOptions = [
    { value: 'all', label: 'All Fuel Types' },
    { value: FuelType.Petrol, label: 'Petrol' },
    { value: FuelType.Diesel, label: 'Diesel' },
  ];
  
  const paymentModeOptions = Object.values(PaymentMode).map(mode => ({ value: mode, label: mode.charAt(0).toUpperCase() + mode.slice(1) }));

  if (selectedUser) {
    const userData = salesData.find(d => d.name === selectedUser);
    const userTransactions = allTransactions.filter(tx => tx.userName === selectedUser);
    const todayDate = getTodayDateString();
    const userReadings = allReadings[selectedUser]?.[todayDate] || { petrol2pm: '', petrol10pm: '', diesel2pm: '', diesel10pm: '' };
    
    return (
      <UserDashboard
        user={userData!}
        onBack={() => setSelectedUser(null)}
        settings={settings}
        owners={owners}
        userTransactions={userTransactions}
        userReadings={userReadings}
        onSaveTransaction={(tx, isEditing) => handleSaveTransaction({ ...tx, userName: selectedUser, userAvatarUrl: userData?.avatarUrl || '' }, isEditing)}
        onSaveDeposit={(amount) => handleSaveDeposit(selectedUser, amount)}
        onReadingChange={(field, value) => handleReadingChange(selectedUser, field, value)}
        onUpdateOwner={handleUpdateOwner}
      />
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <Header onSettingsClick={() => setIsModalOpen(true)} />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-lg text-gray-300">{formatDateTime(currentTime)}</p>
          </div>
          
          <TotalSummaryCard data={totalSummaryData} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
            {salesData.map((data) => (
              <SalesCard 
                key={data.name} 
                data={data} 
                onClick={() => setSelectedUser(data.name)}
              />
            ))}
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">All Transactions</h2>
              <button 
                onClick={() => setIsFilterPanelOpen(prev => !prev)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                aria-expanded={isFilterPanelOpen}
                aria-label="Toggle Filters"
              >
                <FilterIcon />
                <span className="font-semibold text-sm">Filter</span>
                {activeFilterCount > 0 && (
                  <span className="bg-cyan-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out ${isFilterPanelOpen ? 'max-h-96 opacity-100 mb-4 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <input 
                      type="text"
                      placeholder="Search Vehicle/Owner..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
                  />
                  <MultiSelect
                      placeholder="Select Users"
                      options={userOptions}
                      selectedValues={filterUsers}
                      onChange={setFilterUsers}
                  />
                  <CustomSelect
                      placeholder="Select Fuel Type"
                      options={fuelTypeOptions}
                      value={filterFuelType}
                      onChange={(v) => setFilterFuelType(v as FuelType | 'all')}
                  />
                  <MultiSelect
                      placeholder="Select Payment Modes"
                      options={paymentModeOptions}
                      selectedValues={filterPaymentModes}
                      onChange={(v) => setFilterPaymentModes(v as PaymentMode[])}
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 text-right">
                  <button onClick={handleClearFilters} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            <TransactionHistory transactions={transactionsToShow} />
            {filteredTransactions.length > 3 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllTransactions(prev => !prev)}
                  className="bg-gray-700 text-cyan-400 font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {showAllTransactions ? 'Show Less' : `Show All ${filteredTransactions.length} Transactions`}
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        currentSettings={settings}
        owners={owners}
        onAddOwner={handleAddOwner}
        onDeleteOwner={handleDeleteOwner}
        onUpdateOwner={handleUpdateOwner}
        attendants={attendants}
        onAddAttendant={handleAddAttendant}
        onDeleteAttendant={handleDeleteAttendant}
        onEndShift={handleEndShift}
        onResetAllData={handleResetAllData}
      />
    </div>
  );
};

export default App;