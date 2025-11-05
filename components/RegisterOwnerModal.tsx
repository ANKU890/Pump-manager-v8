import React, { useState } from 'react';
import type { Owner, Vehicle } from '../types.ts';
import { VehicleType } from '../types.ts';
import CloseIcon from './icons/CloseIcon.tsx';

interface RegisterOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (ownerId: string, vehicle: Vehicle) => void;
  owners: Owner[];
  vehicleNumber: string;
}

const RegisterOwnerModal: React.FC<RegisterOwnerModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  owners,
  vehicleNumber,
}) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.Car);

  const handleRegister = () => {
    if (selectedOwnerId) {
      onRegister(selectedOwnerId, { number: vehicleNumber, type: vehicleType });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md m-4 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`.animate-fade-in-scale { animation: fade-in-scale 0.2s forwards ease-out; } @keyframes fade-in-scale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <h2 className="text-lg font-bold text-white">Register Vehicle: <span className="text-cyan-400">{vehicleNumber}</span></h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-4">Select an owner to assign this vehicle to:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {owners.map((owner) => (
              <button
                key={owner.id}
                onClick={() => setSelectedOwnerId(owner.id)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 border-2 ${
                  selectedOwnerId === owner.id
                    ? 'bg-cyan-500 border-cyan-500 text-white'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                {owner.name}
              </button>
            ))}
          </div>
           <div className="mt-4">
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-400 mb-2">Vehicle Type</label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white capitalize focus:ring-2 focus:ring-cyan-500"
            >
              {Object.values(VehicleType).map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleRegister}
            disabled={!selectedOwnerId}
            className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors duration-200"
          >
            Register to Selected Owner
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterOwnerModal;