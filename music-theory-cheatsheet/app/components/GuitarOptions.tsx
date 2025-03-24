'use client';

import { useState, useEffect } from 'react';
import { getGuitarTunings, GuitarTuning } from '../utils/guitarTunings';

interface GuitarOptionsProps {
  onStringCountChange: (count: 6 | 7) => void;
  onTuningChange: (tuning: GuitarTuning) => void;
  initialStringCount?: 6 | 7;
  initialTuning?: string;
}

export default function GuitarOptions({ 
  onStringCountChange, 
  onTuningChange,
  initialStringCount = 6,
  initialTuning = 'standard'
}: GuitarOptionsProps) {
  const [stringCount, setStringCount] = useState<6 | 7>(initialStringCount);
  const [tuningKey, setTuningKey] = useState(initialTuning);
  
  // Get available tunings based on string count
  const tunings = getGuitarTunings(stringCount);
  
  // Update parent components when options change
  useEffect(() => {
    onStringCountChange(stringCount);
    // Make sure the tuning exists for this string count
    if (tunings[tuningKey]) {
      onTuningChange(tunings[tuningKey]);
    } else {
      // Default to standard if tuning doesn't exist for this string count
      setTuningKey('standard');
      onTuningChange(tunings.standard);
    }
  }, [stringCount, tuningKey, onStringCountChange, onTuningChange]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          String Count
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setStringCount(6)}
            className={`px-3 py-1 rounded ${
              stringCount === 6 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300'
            }`}
          >
            6 Strings
          </button>
          <button
            onClick={() => setStringCount(7)}
            className={`px-3 py-1 rounded ${
              stringCount === 7 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300'
            }`}
          >
            7 Strings
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="tuning" className="block text-sm font-medium text-gray-700 mb-1">
          Tuning
        </label>
        <select
          id="tuning"
          value={tuningKey}
          onChange={(e) => setTuningKey(e.target.value)}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(tunings).map(([key, tuning]) => (
            <option key={key} value={key}>
              {tuning.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
