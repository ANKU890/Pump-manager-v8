import React, { useState, useEffect } from 'react';
import type { Settings, Owner, Attendant, Vehicle } from '../types.ts';
import { VehicleType } from '../types.ts';
import CloseIcon from './icons/CloseIcon.tsx';
import UserGroupIcon from './icons/UserGroupIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import PlusCircleIcon from './icons/PlusCircleIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import CogIcon from './icons/CogIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import AuthorizationModal from './AuthorizationModal.tsx';


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (settings: Settings) => void;
  currentSettings: Settings;
  owners: Owner[];
  onAddOwner: (name: string) => Promise<void>;
  onDeleteOwner: (id: string) => Promise<void>;
  onUpdateOwner: (owner: Owner) => Promise<void>;
  attendants: Attendant[];
  onAddAttendant: (name: string) => Promise<void>;
  onDeleteAttendant: (id: string) => Promise<void>;
  onEndShift: () => Promise<void>;
  onResetAllData: () => Promise<void>;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      isActive
        ? 'text-cyan-400 border-cyan-400'
        : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);


// General Settings View component
const GeneralSettingsView: React.FC<{
  settings: Settings;
  onUpdate: (newSettings: Settings) => void;
}> = ({ settings, onUpdate }) => {
    const [petrolRate, setPetrolRate] = useState(String(settings.petrolRate));
    const [dieselRate, setDieselRate] = useState(String(settings.dieselRate));
    const [advanceCash, setAdvanceCash] = useState(String(settings.advanceCash));

    const handleUpdateClick = () => {
        onUpdate({
            petrolRate: parseFloat(petrolRate) || 0,
            dieselRate: parseFloat(dieselRate) || 0,
            advanceCash: parseFloat(advanceCash) || 0,
        });
    };
    
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="petrolRate" className="block text-sm font-medium text-gray-400 mb-1">Petrol Rate (₹)</label>
                <input type="number" id="petrolRate" value={petrolRate} onChange={(e) => setPetrolRate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 105.41" />
            </div>
            <div>
                <label htmlFor="dieselRate" className="block text-sm font-medium text-gray-400 mb-1">Diesel Rate (₹)</label>
                <input type="number" id="dieselRate" value={dieselRate} onChange={(e) => setDieselRate(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 96.76" />
            </div>
            <div>
                <label htmlFor="advanceCash" className="block text-sm font-medium text-gray-400 mb-1">Advance Cash (₹)</label>
                <input type="number" id="advanceCash" value={advanceCash} onChange={(e) => setAdvanceCash(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500" placeholder="e.g., 5000" />
            </div>
             <div className="mt-6 flex justify-end">
                <button onClick={handleUpdateClick} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">
                    Update Settings
                </button>
            </div>
        </div>
    );
};

// Partners View component
const PartnersView: React.FC<{
    owners: Owner[];
    onAddOwner: (name: string) => Promise<void>;
    onDeleteOwner: (id: string) => Promise<void>;
    onUpdateOwner: (owner: Owner) => Promise<void>;
}> = ({ owners, onAddOwner, onDeleteOwner, onUpdateOwner }) => {
    const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
    const [newOwnerName, setNewOwnerName] = useState('');
    const [showAddOwner, setShowAddOwner] = useState(false);
    const [vehicleErrors, setVehicleErrors] = useState<Record<string, string | null>>({});

    const handleAddNewOwner = async () => {
        if(newOwnerName.trim()) {
            await onAddOwner(newOwnerName.trim());
            setNewOwnerName('');
            setShowAddOwner(false);
        }
    };

    const handleDeleteOwnerClick = (ownerId: string) => {
        if (window.confirm('Are you sure you want to delete this owner and all their vehicles?')) {
            onDeleteOwner(ownerId);
        }
    };

    const handleUpdateOwnerName = (ownerId: string, newName: string) => {
        const owner = owners.find(o => o.id === ownerId);
        if (owner && newName.trim()) {
            onUpdateOwner({...owner, name: newName.trim()});
        }
    };

    const handleAddVehicle = (ownerId: string, vehicleNumber: string, vehicleType: VehicleType) => {
        setVehicleErrors(prev => ({ ...prev, [ownerId]: null }));
        const owner = owners.find(o => o.id === ownerId);
        if (owner && vehicleNumber.trim()) {
            const newVehicle: Vehicle = { number: vehicleNumber.trim().toUpperCase(), type: vehicleType };
            if (owner.vehicles.some(v => v.number === newVehicle.number)) {
                setVehicleErrors(prev => ({ ...prev, [ownerId]: 'This vehicle number already exists.' }));
                return;
            }
            const updatedVehicles = [...owner.vehicles, newVehicle];
            onUpdateOwner({...owner, vehicles: updatedVehicles});
        }
    };

    const handleDeleteVehicle = (ownerId: string, vehicleNumber: string) => {
        const owner = owners.find(o => o.id === ownerId);
        if (owner) {
            onUpdateOwner({...owner, vehicles: owner.vehicles.filter(v => v.number !== vehicleNumber)});
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Partner / Owner List</h3>
                <button onClick={() => setShowAddOwner(!showAddOwner)} className="p-2 rounded-full hover:bg-gray-700">
                    <PlusCircleIcon />
                </button>
            </div>
            {showAddOwner && (
                 <div className="flex gap-2 mb-4">
                    <input type="text" value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} placeholder="New owner name" className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-white"/>
                    <button onClick={handleAddNewOwner} className="bg-cyan-500 text-white font-bold px-4 rounded-lg hover:bg-cyan-600">Add</button>
                </div>
            )}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {owners.map(owner => (
                    <div key={owner.id} className="bg-gray-700/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{owner.name}</p>
                                <p className="text-xs text-gray-400">{owner.vehicles.length} vehicle(s)</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setEditingOwnerId(editingOwnerId === owner.id ? null : owner.id)} className="p-1 text-gray-400 hover:text-white"><EditIcon /></button>
                                <button onClick={() => handleDeleteOwnerClick(owner.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </div>
                        </div>
                        {editingOwnerId === owner.id && (
                            <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                                <div className="flex gap-2">
                                    <input type="text" defaultValue={owner.name} onBlur={e => handleUpdateOwnerName(owner.id, e.target.value)} className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-white" />
                                </div>
                                <form className="flex gap-2 items-end" onSubmit={e => { e.preventDefault(); handleAddVehicle(owner.id, (e.currentTarget.elements.namedItem('vehicleNumber') as HTMLInputElement).value, (e.currentTarget.elements.namedItem('vehicleType') as HTMLSelectElement).value as VehicleType); e.currentTarget.reset(); }}>
                                    <div className="flex-grow">
                                        <label className="text-xs text-gray-400">Vehicle Number</label>
                                        <input 
                                            name="vehicleNumber" 
                                            type="text" 
                                            placeholder="Add vehicle number" 
                                            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white uppercase"
                                            onChange={() => setVehicleErrors(prev => ({ ...prev, [owner.id]: null }))}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs text-gray-400">Type</label>
                                        <select name="vehicleType" className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 h-10 text-white capitalize">
                                            {Object.values(VehicleType).map(type => (
                                                <option key={type} value={type} className="capitalize">{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="bg-green-500 text-white font-bold px-4 h-10 rounded-lg hover:bg-green-600">Add</button>
                                </form>
                                {vehicleErrors[owner.id] && <p className="text-red-500 text-xs mt-1">{vehicleErrors[owner.id]}</p>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    {owner.vehicles.map(v => (
                                        <div key={v.number} className="bg-gray-800 p-2 rounded-md flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold text-gray-300">{v.number}</span>
                                                <span className="block text-xs text-gray-400 capitalize">{v.type}</span>
                                            </div>
                                            <button onClick={() => handleDeleteVehicle(owner.id, v.number)} className="text-gray-500 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Attendants View component
const AttendantsView: React.FC<{
    attendants: Attendant[];
    onAddAttendant: (name: string) => Promise<void>;
    onDeleteAttendant: (id: string) => Promise<void>;
}> = ({ attendants, onAddAttendant, onDeleteAttendant }) => {
    const [newAttendantName, setNewAttendantName] = useState('');

    const handleAdd = async () => {
        if(newAttendantName.trim()){
            await onAddAttendant(newAttendantName.trim());
            setNewAttendantName('');
        }
    };
    
    const handleDelete = (id: string, name: string) => {
        if(window.confirm(`Are you sure you want to delete attendant '${name}'? This cannot be undone.`)){
            onDeleteAttendant(id);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-white mb-4">Pump Attendants</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newAttendantName}
                    onChange={(e) => setNewAttendantName(e.target.value)}
                    placeholder="New attendant name"
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                />
                <button onClick={handleAdd} className="bg-cyan-500 text-white font-bold px-4 rounded-lg hover:bg-cyan-600">
                    Add
                </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {attendants.map(attendant => (
                    <div key={attendant.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <img src={attendant.avatarUrl} alt={attendant.name} className="w-8 h-8 rounded-full" />
                            <p className="font-semibold text-white">{attendant.name}</p>
                        </div>
                        <button onClick={() => handleDelete(attendant.id, attendant.name)} className="p-1 text-gray-400 hover:text-red-500">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ShiftManagementView: React.FC<{
  onEndShiftClick: () => void;
  onResetClick: () => void;
}> = ({ onEndShiftClick, onResetClick }) => {
  return (
    <div className="space-y-8">
      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white">End Current Shift</h3>
        <p className="text-sm text-gray-400 mt-1 mb-4">
          This will delete all transactions and daily meter readings. Partner and attendant data will be kept. This action cannot be undone.
        </p>
        <button 
          onClick={onEndShiftClick}
          className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          End Shift
        </button>
      </div>
      <div className="bg-gray-900/50 p-4 rounded-lg border border-red-500/50">
        <h3 className="text-lg font-bold text-red-400">Reset Application Data</h3>
        <p className="text-sm text-gray-400 mt-1 mb-4">
          This will permanently delete ALL data, including transactions, readings, partners, and attendants, and restore the app to its initial state. Use with extreme caution.
        </p>
        <button 
          onClick={onResetClick}
          className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};


const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onUpdateSettings,
  currentSettings,
  owners,
  onAddOwner,
  onDeleteOwner,
  onUpdateOwner,
  attendants,
  onAddAttendant,
  onDeleteAttendant,
  onEndShift,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'partners' | 'attendants' | 'shift'>('general');
  const [authAction, setAuthAction] = useState<'endShift' | 'reset' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('general');
    }
  }, [isOpen]);

  const handleAuthSuccess = async () => {
    if (authAction === 'endShift') {
      await onEndShift();
    } else if (authAction === 'reset') {
      await onResetAllData();
    }
    setAuthAction(null);
    onClose(); // Close the main settings modal after action
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose} role="dialog">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg m-4 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <style>{`
            @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            .animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; }
            .horizontal-scrollbar::-webkit-scrollbar { height: 4px; }
            .horizontal-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .horizontal-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 2px; }
            .horizontal-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
          `}</style>
          
          <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close settings"><CloseIcon /></button>
          </div>
          
          <div className="border-b border-gray-700 flex-shrink-0">
            <div className="overflow-x-auto horizontal-scrollbar">
              <nav className="flex -mb-px px-2 sm:px-4">
                <TabButton label="General" icon={<CogIcon />} isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <TabButton label="Partners" icon={<UserGroupIcon />} isActive={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
                <TabButton label="Attendants" icon={<UsersIcon />} isActive={activeTab === 'attendants'} onClick={() => setActiveTab('attendants')} />
                <TabButton label="Shift" icon={<ClockIcon />} isActive={activeTab === 'shift'} onClick={() => setActiveTab('shift')} />
              </nav>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <GeneralSettingsView settings={currentSettings} onUpdate={onUpdateSettings} />
              )}
              {activeTab === 'partners' && (
                <PartnersView
                  owners={owners}
                  onAddOwner={onAddOwner}
                  onDeleteOwner={onDeleteOwner}
                  onUpdateOwner={onUpdateOwner}
                />
              )}
               {activeTab === 'attendants' && (
                <AttendantsView
                  attendants={attendants}
                  onAddAttendant={onAddAttendant}
                  onDeleteAttendant={onDeleteAttendant}
                />
              )}
              {activeTab === 'shift' && (
                <ShiftManagementView
                  onEndShiftClick={() => setAuthAction('endShift')}
                  onResetClick={() => setAuthAction('reset')}
                />
              )}
          </div>
        </div>
      </div>
      <AuthorizationModal
        isOpen={!!authAction}
        onClose={() => setAuthAction(null)}
        onSuccess={handleAuthSuccess}
        title={authAction === 'endShift' ? 'Authorize Shift End' : 'Authorize Full Data Reset'}
      />
    </>
  );
};

export default SettingsModal;
