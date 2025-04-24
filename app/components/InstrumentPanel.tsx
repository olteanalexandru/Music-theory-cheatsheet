import { useState } from 'react';
import GuitarOptions from './GuitarOptions';
import { getGuitarTunings } from '../utils/guitarTunings';

export function InstrumentPanel() {
  const [instrument, setInstrument] = useState('guitar');
  const [guitarStringCount, setGuitarStringCount] = useState<6 | 7>(6);
  const [tuning, setTuning] = useState('standard');
  
  const availableTunings = instrument === 'guitar' 
    ? getGuitarTunings(guitarStringCount)
    : {};
  
  return (
    <div>
      {/* Instrument selection UI */}
      {instrument === 'guitar' && (
        <GuitarOptions 
          onStringCountChange={setGuitarStringCount}
          selectedStringCount={guitarStringCount}
        />
      )}
      
      {/* Tuning selection */}
      <div className="mt-4">
        <h3 className="font-medium">Tuning</h3>
        <select 
          value={tuning} 
          onChange={(e) => setTuning(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          {Object.entries(availableTunings).map(([key, tuningOption]) => (
            <option key={key} value={key}>
              {tuningOption.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
