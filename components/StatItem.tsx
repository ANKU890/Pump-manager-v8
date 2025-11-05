import React from 'react';

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; unit?: string }> = ({ icon, label, value, unit }) => (
    <div className="bg-gray-800 rounded-lg p-4 transition-colors hover:bg-gray-700/50">
        <div className="flex items-center text-gray-400 mb-2">
            <div className="text-cyan-400">{icon}</div>
            <span className="ml-2 text-sm font-medium">{label}</span>
        </div>
        <p className="text-xl font-semibold text-white truncate">
            {value}
            {unit && <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>}
        </p>
    </div>
);

export default StatItem;
