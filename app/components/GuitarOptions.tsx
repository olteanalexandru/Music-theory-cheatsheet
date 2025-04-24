import React from 'react';

interface GuitarOptionsProps {
  onStringCountChange: (count: 6 | 7) => void;
  selectedStringCount: 6 | 7;
}

const GuitarOptions: React.FC<GuitarOptionsProps> = ({ onStringCountChange, selectedStringCount }) => {
  return (
    <div>
      <h3 className="font-medium">Guitar Options</h3>
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">String Count</label>
        <select
          value={selectedStringCount}
          onChange={(e) => onStringCountChange(Number(e.target.value) as 6 | 7)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value={6}>6 Strings</option>
          <option value={7}>7 Strings</option>
        </select>
      </div>
    </div>
  );
};

export default GuitarOptions;
