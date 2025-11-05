import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Settings, Transaction, Owner, Vehicle } from '../types.ts';
import { FuelType, PaymentMode, TransactionType, VehicleType } from '../types.ts';
import CloseIcon from './icons/CloseIcon.tsx';
import RegisterOwnerModal from './RegisterOwnerModal.tsx';
import CustomSelect from './CustomSelect.tsx';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction, isEditing: boolean) => void;
  settings: Settings;
  owners: Owner[];
  onUpdateOwner: (owner: Owner) => Promise<void>;
  transactionToEdit?: Transaction | null;
}

const RadioButtonGroup: React.FC<{
    options: { value: string; label: string }[];
    selectedValue: string | null;
    onChange: (value: string) => void;
    name: string;
    disabled?: boolean;
}> = ({ options, selectedValue, onChange, name, disabled = false }) => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2`}>
        {options.map(({ value, label }) => (
            <button
                key={value}
                type="button"
                name={name}
                onClick={() => onChange(value)}
                disabled={disabled}
                className={`p-3 rounded-md text-center font-semibold transition-all duration-200 border-2 ${
                    selectedValue === value
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {label}
            </button>
        ))}
    </div>
);

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, settings, owners, onUpdateOwner, transactionToEdit }) => {
    const [paytmCashAmount, setPaytmCashAmount] = useState('');
    const [fuelType, setFuelType] = useState<FuelType | null>(null);
    const [fuelForm, setFuelForm] = useState<'amount' | 'volume' | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [paymentMode, setPaymentMode] = useState<PaymentMode | 'paytm_cash' | null>(null);
    const [amountPaid, setAmountPaid] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleOwner, setVehicleOwner] = useState<string | null>(null);
    const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
    const [isGallonSale, setIsGallonSale] = useState(false);
    const [selectedGallonOwner, setSelectedGallonOwner] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    
    // State for complex transactions
    const [isCashBack, setIsCashBack] = useState(false);
    const [isSplitCashBack, setIsSplitCashBack] = useState(false);
    const [splitCashAmount, setSplitCashAmount] = useState('');
    const [splitPaytmAmount, setSplitPaytmAmount] = useState('');

    // State for vehicle suggestions
    const [vehicleSuggestions, setVehicleSuggestions] = useState<(Vehicle & { ownerName: string })[]>([]);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    
    const isEditing = !!transactionToEdit;

    const resetForm = () => {
        setPaytmCashAmount('');
        setPaymentMode(null);
        setFuelType(null);
        setFuelForm(null);
        setInputValue('');
        setAmountPaid('');
        setVehicleNumber('');
        setVehicleOwner(null);
        setVehicleType(null);
        setIsGallonSale(false);
        setSelectedGallonOwner('');
        setError(null);
        setIsCashBack(false);
        setIsSplitCashBack(false);
        setSplitCashAmount('');
        setSplitPaytmAmount('');
        setVehicleSuggestions([]);
    };

    useEffect(() => {
        if (isOpen) {
            if (isEditing && transactionToEdit) {
                setPaymentMode(transactionToEdit.paymentMode!);
                setFuelType(transactionToEdit.fuelType!);
                setFuelForm('amount');
                setInputValue(String(transactionToEdit.fuelAmount.toFixed(2)));
                setAmountPaid(transactionToEdit.amountPaid ? String(transactionToEdit.amountPaid) : '');
                setVehicleNumber(transactionToEdit.vehicleNumber || '');
                setIsCashBack(!!transactionToEdit.cashBack && transactionToEdit.cashBack > 0);
                if (transactionToEdit.paymentMode === PaymentMode.Split) {
                    setSplitCashAmount(String(transactionToEdit.paymentDetails?.cash || ''));
                    setSplitPaytmAmount(String(transactionToEdit.paymentDetails?.paytm || ''));
                    setIsSplitCashBack(!!transactionToEdit.cashBack && transactionToEdit.cashBack > 0);
                }
            } else {
                resetForm();
            }
        }
    }, [isOpen, isEditing, transactionToEdit]);

    useEffect(() => {
        // Reset specific fields when payment mode changes during a new transaction
        if (!isEditing) {
            setAmountPaid('');
            setVehicleNumber('');
            setVehicleOwner(null);
            setVehicleType(null);
            setIsCashBack(false);
            setIsSplitCashBack(false);
            setSplitCashAmount('');
            setSplitPaytmAmount('');
            setVehicleSuggestions([]);
            
            if (paymentMode === 'paytm_cash') {
                setFuelType(null);
                setFuelForm(null);
                setInputValue('');
            } else {
                setPaytmCashAmount('');
            }
        }
    }, [paymentMode, isEditing]);
    
    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
            setVehicleSuggestions([]);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClose = () => {
        onClose();
    };

    const rate = useMemo(() => {
        if (fuelType === FuelType.Petrol) return settings.petrolRate;
        if (fuelType === FuelType.Diesel) return settings.dieselRate;
        return 0;
    }, [fuelType, settings]);

    const { fuelAmount, fuelVolume } = useMemo(() => {
        const numValue = parseFloat(inputValue);
        if (!fuelForm || !rate || isNaN(numValue) || numValue <= 0) {
            return { fuelAmount: 0, fuelVolume: 0 };
        }
        if (fuelForm === 'amount') {
            return { fuelAmount: numValue, fuelVolume: numValue / rate };
        }
        if (fuelForm === 'volume') {
            return { fuelAmount: numValue * rate, fuelVolume: numValue };
        }
        return { fuelAmount: 0, fuelVolume: 0 };
    }, [inputValue, fuelForm, rate]);

    const changeReturned = useMemo(() => {
        if (paymentMode === PaymentMode.Bill || paymentMode === PaymentMode.Split) {
            return null;
        }

        if (paymentMode === PaymentMode.Paytm && isCashBack) {
            return null;
        }

        const paid = parseFloat(amountPaid);

        if (isNaN(paid) || !fuelAmount || paid <= 0) {
            return null;
        }

        return paid - fuelAmount;
    }, [amountPaid, fuelAmount, paymentMode, isCashBack]);

    const cashBackAmount = useMemo(() => {
        if (paymentMode !== PaymentMode.Paytm || !isCashBack) return 0;
        const paid = parseFloat(amountPaid) || 0;
        return paid > fuelAmount ? paid - fuelAmount : 0;
    }, [amountPaid, fuelAmount, paymentMode, isCashBack]);
    
    const splitCashBackAmount = useMemo(() => {
        if (paymentMode !== PaymentMode.Split || !isSplitCashBack) return 0;
        const totalPaid = (parseFloat(splitCashAmount) || 0) + (parseFloat(splitPaytmAmount) || 0);
        return totalPaid > fuelAmount ? totalPaid - fuelAmount : 0;
    }, [splitCashAmount, splitPaytmAmount, fuelAmount, paymentMode, isSplitCashBack]);


    useEffect(() => {
        if (paymentMode === PaymentMode.Bill && vehicleNumber.trim() && !isGallonSale) {
            const searchVehicleNumber = vehicleNumber.trim().toLowerCase();
            let foundOwnerName: string | null = null;
            let foundVehicleType: VehicleType | null = null;
            
            for (const owner of owners) {
                const foundVehicle = owner.vehicles?.find(v => v?.number?.toLowerCase() === searchVehicleNumber);
                if (foundVehicle) {
                    foundOwnerName = owner.name;
                    foundVehicleType = foundVehicle.type;
                    break;
                }
            }
            setVehicleOwner(foundOwnerName || 'Unknown');
            setVehicleType(foundVehicleType);
        } else if (!isGallonSale) {
            setVehicleOwner(null);
            setVehicleType(null);
        }
    }, [vehicleNumber, paymentMode, owners, isGallonSale]);

    const handleVehicleNumberChange = (value: string) => {
        const searchTerm = value.trim().toLowerCase();
        setVehicleNumber(value);

        if (paymentMode === PaymentMode.Bill && searchTerm.length >= 2) {
            const suggestions: (Vehicle & { ownerName: string })[] = [];
            owners.forEach(owner => {
                owner.vehicles?.forEach(vehicle => {
                    if (vehicle.number.toLowerCase() !== searchTerm && vehicle.number.toLowerCase().endsWith(searchTerm)) {
                        suggestions.push({ ...vehicle, ownerName: owner.name });
                    }
                });
            });
            setVehicleSuggestions(suggestions);
        } else {
            setVehicleSuggestions([]);
        }
    
        if (searchTerm === 'gallon') {
            setIsGallonSale(true);
            setVehicleOwner(null);
        } else {
            setIsGallonSale(false);
            setSelectedGallonOwner('');
        }
    };
    
    const handleGallonOwnerSelect = (ownerId: string) => {
        const owner = owners.find(o => o.id === ownerId);
        if (owner) {
            setSelectedGallonOwner(owner.id);
            setVehicleOwner(owner.name);
            setVehicleNumber('GALLON');
        }
    };
    
    const handleRegisterVehicle = (ownerId: string, vehicle: Vehicle) => {
        const ownerToUpdate = owners.find(o => o.id === ownerId);
        if (ownerToUpdate && !ownerToUpdate.vehicles.some(v => v.number === vehicle.number)) {
            const updatedOwner = {
                ...ownerToUpdate,
                vehicles: [...ownerToUpdate.vehicles, vehicle]
            };
            onUpdateOwner(updatedOwner);
        }
        setIsRegisterModalOpen(false);
    };

    const handleSuggestionClick = (vehicle: Vehicle) => {
        setVehicleNumber(vehicle.number);
        setVehicleSuggestions([]);
    };

    const handleCommit = () => {
        setError(null);
        if (!paymentMode) {
            setError('Please select a payment mode.');
            return;
        }

        if (paymentMode === 'paytm_cash') {
            const amount = parseFloat(paytmCashAmount);
            if (isNaN(amount) || amount <= 0) {
                setError('Please enter a valid amount.');
                return;
            }
            const newTransaction: Transaction = {
                id: '',
                timestamp: new Date().toISOString(),
                type: TransactionType.PaytmCash,
                fuelAmount: amount,
            };
            onSave(newTransaction, false);
            return;
        }

        // --- Fuel Sale Logic ---
        if (!fuelType) { setError('Please select a fuel type.'); return; }
        if (!fuelForm) { setError('Please select amount or volume.'); return; }
        if (fuelAmount <= 0) { setError('Please enter a valid amount or volume.'); return; }

        const finalTransaction: Transaction = {
            id: isEditing && transactionToEdit ? transactionToEdit.id : '',
            timestamp: isEditing && transactionToEdit ? transactionToEdit.timestamp : new Date().toISOString(),
            type: TransactionType.Sale,
            fuelType: fuelType!,
            fuelAmount,
            fuelVolume,
            paymentMode: paymentMode as PaymentMode,
        };
        
        if (paymentMode === PaymentMode.Paytm) {
            const paid = parseFloat(amountPaid);
            if (isNaN(paid) || paid <= 0) {
                setError('Please enter amount paid by customer.');
                return;
            }
            finalTransaction.amountPaid = paid;
            if (isCashBack) {
                const cashBack = paid - fuelAmount;
                if (cashBack <= 0) {
                    setError('Total Paytm received must be greater than fuel amount for cash back.');
                    return;
                }
                finalTransaction.cashBack = cashBack;
            } else {
                 if (changeReturned !== null) {
                    finalTransaction.changeReturned = changeReturned;
                }
            }
        } else if (paymentMode === PaymentMode.Cash || paymentMode === PaymentMode.Card) {
             const paid = parseFloat(amountPaid);
            if (isNaN(paid) || paid <= 0) {
                setError('Please enter amount paid by customer.');
                return;
            }
            finalTransaction.amountPaid = paid;
            if (changeReturned !== null) {
                finalTransaction.changeReturned = changeReturned;
            }
        } else if (paymentMode === PaymentMode.Bill) {
            if (!vehicleNumber.trim()) {
                setError('Please enter a vehicle number or "Gallon" for bill payments.');
                return;
            }
            if (isGallonSale && !selectedGallonOwner) {
                setError('Please select a partner for the Gallon sale.');
                return;
            }
            finalTransaction.vehicleNumber = vehicleNumber.trim().toUpperCase();
            if (vehicleOwner) {
                finalTransaction.vehicleOwner = vehicleOwner;
            }
            if (vehicleType) {
                finalTransaction.vehicleType = vehicleType;
            }
        } else if (paymentMode === PaymentMode.Split) {
            const cash = parseFloat(splitCashAmount) || 0;
            const paytm = parseFloat(splitPaytmAmount) || 0;
            if (cash <= 0 && paytm <= 0) {
                setError('Please enter a valid amount for either cash or Paytm.');
                return;
            }
            if(isSplitCashBack) {
                const cashBack = (cash + paytm) - fuelAmount;
                if (cashBack <= 0) {
                    setError('Total paid must be greater than fuel amount for cash back.');
                    return;
                }
                finalTransaction.cashBack = cashBack;
            } else {
                 if (Math.abs((cash + paytm) - fuelAmount) > 0.01) {
                    setError('The sum of cash and Paytm must equal the total fuel amount.');
                    return;
                }
            }
           
            finalTransaction.paymentDetails = { cash, paytm };
        }
        
        onSave(finalTransaction, isEditing);
    };

    if (!isOpen) return null;

    const ownerOptionsForSelect = owners.map(o => ({ value: o.id, label: o.name }));

    const paymentOptions = [
        ...Object.values(PaymentMode).map(m => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ') })),
        { value: 'paytm_cash', label: 'Paytm to Cash' }
    ];

    const numSplitCash = parseFloat(splitCashAmount) || 0;
    const numSplitPaytm = parseFloat(splitPaytmAmount) || 0;
    const totalSplitPaid = numSplitCash + numSplitPaytm;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                onClick={handleClose}
            >
                <div
                    className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg m-4 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <style>{`
                        @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                        .animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; }
                    `}</style>
                    <div className="flex justify-between items-center border-b border-gray-700 p-4 flex-shrink-0">
                        <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Transaction' : 'Record Transaction'}</h2>
                        <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Mode of Payment</label>
                            <RadioButtonGroup 
                                name="paymentMode" 
                                options={paymentOptions} 
                                selectedValue={paymentMode} 
                                onChange={(v) => setPaymentMode(v as PaymentMode | 'paytm_cash')}
                                disabled={isEditing}
                            />
                        </div>

                        {paymentMode && paymentMode !== 'paytm_cash' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Type</label>
                                    <RadioButtonGroup name="fuelType" options={[{value: FuelType.Petrol, label: 'Petrol'}, {value: FuelType.Diesel, label: 'Diesel'}]} selectedValue={fuelType} onChange={(v) => setFuelType(v as FuelType)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Fuel Form</label>
                                    <RadioButtonGroup name="fuelForm" options={[{value: 'amount', label: 'Amount (₹)'}, {value: 'volume', label: 'Volume (ltr)'}]} selectedValue={fuelForm} onChange={(v) => setFuelForm(v as 'amount' | 'volume')} />
                                </div>
                                {fuelForm && (
                                    <div>
                                        <label htmlFor="inputValue" className="block text-sm font-medium text-gray-400 mb-2 capitalize">{fuelForm}</label>
                                        <input type="number" id="inputValue" value={inputValue} onChange={e => setInputValue(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
                                            placeholder={`Enter ${fuelForm}`}
                                        />
                                    </div>
                                )}
                                {fuelAmount > 0 && (
                                    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 text-center space-y-2">
                                        <div className="flex justify-between items-center text-lg">
                                            <span className="text-gray-300">Total:</span>
                                            <span className="font-bold text-white">₹{fuelAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-400">Volume:</span>
                                            <span className="font-semibold text-gray-200">{fuelVolume.toFixed(2)} ltr</span>
                                        </div>
                                    </div>
                                )}
                                
                                {(paymentMode === PaymentMode.Cash || paymentMode === PaymentMode.Card || paymentMode === PaymentMode.Paytm) && (
                                    <div>
                                        <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-400 mb-2">
                                            {paymentMode === PaymentMode.Paytm && isCashBack ? 'Total Paytm Received (₹)' : 'Amount Paid (₹)'}
                                        </label>
                                        <input type="number" id="amountPaid" value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" placeholder="Amount from customer" />
                                        {paymentMode === PaymentMode.Paytm && (
                                            <div className="flex items-center space-x-2 mt-3">
                                                <input type="checkbox" id="isCashBack" checked={isCashBack} onChange={(e) => setIsCashBack(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-cyan-500 focus:ring-cyan-600"/>
                                                <label htmlFor="isCashBack" className="text-sm text-gray-300">Customer wants cash back</label>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {changeReturned !== null && changeReturned !== 0 && (
                                    <div className={`p-3 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-center text-md font-bold ${changeReturned >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{changeReturned >= 0 ? `Change to Return:` : `Amount Due:`}</span>
                                        <span>₹{Math.abs(changeReturned).toFixed(2)}</span>
                                    </div>
                                )}

                                {cashBackAmount > 0 && (
                                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-center text-md font-bold text-yellow-400">
                                        <span>Cash to Return:</span>
                                        <span>₹{cashBackAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {paymentMode === PaymentMode.Split && fuelAmount > 0 && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="splitCashAmount" className="block text-sm font-medium text-gray-400 mb-2">Amount in Cash (₹)</label>
                                                <input type="number" id="splitCashAmount" value={splitCashAmount} onChange={e => setSplitCashAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" />
                                            </div>
                                            <div>
                                                <label htmlFor="splitPaytmAmount" className="block text-sm font-medium text-gray-400 mb-2">Amount in Paytm (₹)</label>
                                                <input type="number" id="splitPaytmAmount" value={splitPaytmAmount} onChange={e => setSplitPaytmAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white" />
                                            </div>
                                        </div>
                                        <div className={`p-3 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-center text-md font-bold ${Math.abs(totalSplitPaid - fuelAmount) < 0.01 && !isSplitCashBack ? 'text-green-400' : 'text-gray-300'}`}>
                                            <span>Total Paid:</span>
                                            <span>₹{totalSplitPaid.toFixed(2)}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <input type="checkbox" id="isSplitCashBack" checked={isSplitCashBack} onChange={(e) => setIsSplitCashBack(e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-cyan-500 focus:ring-cyan-600"/>
                                            <label htmlFor="isSplitCashBack" className="text-sm text-gray-300">Customer wants cash back</label>
                                        </div>
                                    </div>
                                )}
                                
                                {splitCashBackAmount > 0 && (
                                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-center text-md font-bold text-yellow-400">
                                        <span>Cash to Return:</span>
                                        <span>₹{splitCashBackAmount.toFixed(2)}</span>
                                    </div>
                                )}


                                {paymentMode === PaymentMode.Bill && (
                                    <div ref={suggestionsRef}>
                                        <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-400 mb-2">Vehicle Number or "Gallon"</label>
                                        {!isGallonSale ? (
                                            <div className="relative">
                                                <input type="text" id="vehicleNumber" value={vehicleNumber} onChange={e => handleVehicleNumberChange(e.target.value)}
                                                    autoComplete="off"
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white uppercase" placeholder="e.g., MH12AB1234 or GALLON" />
                                                {vehicleSuggestions.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                        {vehicleSuggestions.map((suggestion, index) => (
                                                            <div 
                                                                key={`${suggestion.number}-${index}`}
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                className="p-3 hover:bg-cyan-600 cursor-pointer text-white"
                                                            >
                                                                <p className="font-semibold">{suggestion.number}</p>
                                                                <p className="text-xs text-gray-300">{suggestion.ownerName} <span className="capitalize">({suggestion.type})</span></p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-2">
                                                <CustomSelect
                                                    placeholder="Select Partner for Gallon Sale"
                                                    options={ownerOptionsForSelect}
                                                    value={selectedGallonOwner}
                                                    onChange={handleGallonOwnerSelect}
                                                />
                                            </div>
                                        )}
                                        
                                        {vehicleOwner && (
                                            <p className={`mt-2 text-sm text-center font-semibold ${vehicleOwner === 'Unknown' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {isGallonSale 
                                                    ? `Gallon Sale To: ${vehicleOwner}` 
                                                    : `Owner: ${vehicleOwner} ${vehicleType ? `(${vehicleType})` : ''}`
                                                }
                                                {vehicleOwner === 'Unknown' && 
                                                <button onClick={() => setIsRegisterModalOpen(true)} className="ml-2 text-xs bg-cyan-600 text-white px-2 py-1 rounded-md hover:bg-cyan-700">Register</button>}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        
                        {paymentMode === 'paytm_cash' && (
                             <div>
                                <p className="text-sm text-gray-400 my-4 text-center">Record cash given to a customer against a Paytm payment. This will reduce your cash-in-hand.</p>
                                <label htmlFor="paytmCashAmount" className="block text-sm font-medium text-gray-400 mb-2">Cash Given Out (₹)</label>
                                <input type="number" id="paytmCashAmount" value={paytmCashAmount} onChange={e => setPaytmCashAmount(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Enter amount"
                                />
                                {parseFloat(paytmCashAmount) > 0 &&
                                <div className="p-3 mt-2 bg-gray-900 rounded-lg border border-gray-700 text-center text-lg">
                                    <span className="text-gray-300">Amount: </span>
                                    <span className="font-bold text-red-400">- ₹{parseFloat(paytmCashAmount).toFixed(2)}</span>
                                </div>
                                }
                            </div>
                        )}
                    </div>
                    
                    <div className="p-4 border-t border-gray-700 flex-shrink-0">
                        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
                        <button
                            onClick={handleCommit}
                            disabled={!paymentMode}
                            className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isEditing ? 'Update Transaction' : 'Commit Transaction'}
                        </button>
                    </div>
                </div>
            </div>
            <RegisterOwnerModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onRegister={handleRegisterVehicle}
                owners={owners}
                vehicleNumber={vehicleNumber.trim().toUpperCase()}
            />
        </>
    );
};

export default TransactionModal;