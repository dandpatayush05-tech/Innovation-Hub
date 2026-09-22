import React, { useState } from 'react';
import { Plane, Train, Bus, Check, User, Heart, Shield, Info } from 'lucide-react';

export type TransportMode = 'flight' | 'train' | 'bus';

interface Seat {
  id: string;
  number: string;
  type: 'window' | 'aisle' | 'middle' | 'lower-berth' | 'upper-berth' | 'sleeper';
  category: 'standard' | 'senior-priority' | 'women-preferred' | 'wheelchair-accessible';
  price: number;
  isBooked?: boolean;
}

interface SeatSelectorGridProps {
  mode: TransportMode;
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
  maxSeats?: number;
}

export const SeatSelectorGrid: React.FC<SeatSelectorGridProps> = ({
  mode,
  selectedSeats,
  onSeatToggle,
  maxSeats = 4
}) => {
  // Generate realistic grid for the selected mode
  const seats: Seat[] = React.useMemo(() => {
    const list: Seat[] = [];
    if (mode === 'flight') {
      const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
      const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
      rows.forEach((r, rIdx) => {
        cols.forEach((c) => {
          const id = `${r}${c}`;
          const isWindow = c === 'A' || c === 'F';
          const isAisle = c === 'C' || c === 'D';
          const isSenior = rIdx <= 1; // Front rows
          const isWomen = r === '3' || r === '4';
          const isBooked = (parseInt(r) * 7 + c.charCodeAt(0)) % 5 === 0;

          list.push({
            id,
            number: id,
            type: isWindow ? 'window' : isAisle ? 'aisle' : 'middle',
            category: isSenior ? 'senior-priority' : isWomen ? 'women-preferred' : 'standard',
            price: isSenior ? 350 : isWindow ? 200 : 0,
            isBooked
          });
        });
      });
    } else if (mode === 'train') {
      // 2A / 3A AC Sleeper layout
      for (let i = 1; i <= 24; i++) {
        const isLower = i % 4 === 1 || i % 4 === 2;
        const isSenior = isLower;
        const isBooked = i % 4 === 3;
        list.push({
          id: `B${i}`,
          number: `B-${i}`,
          type: isLower ? 'lower-berth' : 'upper-berth',
          category: isSenior ? 'senior-priority' : 'standard',
          price: isLower ? 150 : 0,
          isBooked
        });
      }
    } else {
      // Luxury Volvo AC Sleeper
      for (let i = 1; i <= 18; i++) {
        const isLower = i <= 9;
        const isWomen = i === 1 || i === 2 || i === 3;
        const isSenior = isLower && i > 3;
        const isBooked = i % 6 === 0;
        list.push({
          id: `SL${i}`,
          number: `S-${i}`,
          type: 'sleeper',
          category: isWomen ? 'women-preferred' : isSenior ? 'senior-priority' : 'standard',
          price: isLower ? 200 : 0,
          isBooked
        });
      }
    }
    return list;
  }, [mode]);

  return (
    <div className="bg-[#FDFBF7] rounded-3xl p-6 border border-black/5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C84B31]/10 text-[#C84B31] flex items-center justify-center">
            {mode === 'flight' && <Plane className="w-5 h-5" />}
            {mode === 'train' && <Train className="w-5 h-5" />}
            {mode === 'bus' && <Bus className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-serif font-bold text-[#2A2A2A] text-base">
              {mode === 'flight' && 'Select Flight Seats (Airbus A321)'}
              {mode === 'train' && 'Select Train Berths (Vande Bharat / AC 2-Tier)'}
              {mode === 'bus' && 'Select Volvo Sleeper Berths (Multi-Axle AC)'}
            </h4>
            <p className="text-xs text-[#2A2A2A]/60">
              Selected {selectedSeats.length} of {maxSeats} seats
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white border border-black/20" />
            <span className="text-[#2A2A2A]/70">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#C84B31] text-white" />
            <span className="text-[#2A2A2A]/70 font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800" />
            <span className="text-[#2A2A2A]/70">Senior Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-pink-100 border border-pink-300 text-pink-800" />
            <span className="text-[#2A2A2A]/70">Women Preferred</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-gray-200" />
            <span className="text-[#2A2A2A]/40">Occupied</span>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      <div className="p-4 bg-white rounded-2xl border border-black/5 overflow-x-auto">
        {mode === 'flight' && (
          <div className="min-w-[480px] max-w-xl mx-auto space-y-3">
            <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
              ✈️ Front of Aircraft (Cockpit)
            </div>
            <div className="grid grid-cols-7 gap-2 items-center text-center">
              <span className="text-xs font-bold text-gray-400">A (Win)</span>
              <span className="text-xs font-bold text-gray-400">B</span>
              <span className="text-xs font-bold text-gray-400">C (Aisle)</span>
              <span className="text-xs font-bold text-gray-300">Aisle</span>
              <span className="text-xs font-bold text-gray-400">D (Aisle)</span>
              <span className="text-xs font-bold text-gray-400">E</span>
              <span className="text-xs font-bold text-gray-400">F (Win)</span>

              {seats.map((seat, idx) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isAisleGap = idx % 6 === 3;

                return (
                  <React.Fragment key={seat.id}>
                    {isAisleGap && (
                      <span className="text-[10px] text-gray-300 font-mono select-none">
                        |
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={seat.isBooked}
                      onClick={() => onSeatToggle(seat.id)}
                      className={`h-10 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                        seat.isBooked
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-dashed border border-gray-200'
                          : isSelected
                          ? 'bg-[#C84B31] text-white shadow-md scale-105 ring-2 ring-[#C84B31]/30'
                          : seat.category === 'senior-priority'
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                          : seat.category === 'women-preferred'
                          ? 'bg-pink-50 text-pink-900 border border-pink-300 hover:bg-pink-100'
                          : 'bg-white text-gray-800 border border-black/10 hover:border-[#C84B31]'
                      }`}
                      title={`${seat.number} (${seat.type}) - ${seat.category}`}
                    >
                      <span>{seat.number}</span>
                      {seat.price > 0 && !isSelected && !seat.isBooked && (
                        <span className="text-[9px] opacity-75">+₹{seat.price}</span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'train' && (
          <div className="min-w-[480px] max-w-xl mx-auto space-y-3">
            <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
              🚆 AC 2-Tier / 3-Tier Coach
            </div>
            <div className="grid grid-cols-6 gap-2 text-center">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.isBooked}
                    onClick={() => onSeatToggle(seat.id)}
                    className={`h-12 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                      seat.isBooked
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-dashed border border-gray-200'
                        : isSelected
                        ? 'bg-[#C84B31] text-white shadow-md scale-105'
                        : seat.category === 'senior-priority'
                        ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-gray-800 border border-black/10 hover:border-[#C84B31]'
                    }`}
                  >
                    <span>{seat.number}</span>
                    <span className="text-[9px] opacity-70">
                      {seat.type === 'lower-berth' ? 'Lower (Sr)' : 'Upper'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === 'bus' && (
          <div className="min-w-[480px] max-w-xl mx-auto space-y-3">
            <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
              🚌 Volvo AC Sleeper Deck
            </div>
            <div className="grid grid-cols-6 gap-2 text-center">
              {seats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.isBooked}
                    onClick={() => onSeatToggle(seat.id)}
                    className={`h-14 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                      seat.isBooked
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed border-dashed border border-gray-200'
                        : isSelected
                        ? 'bg-[#C84B31] text-white shadow-md scale-105'
                        : seat.category === 'women-preferred'
                        ? 'bg-pink-50 text-pink-900 border border-pink-300 hover:bg-pink-100'
                        : seat.category === 'senior-priority'
                        ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-gray-800 border border-black/10 hover:border-[#C84B31]'
                    }`}
                  >
                    <span>{seat.number}</span>
                    <span className="text-[9px] opacity-70">Sleeper</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Lower berths & front rows are automatically prioritized for senior citizens, women, and travelers requesting wheelchair accessibility.
        </span>
      </div>
    </div>
  );
};
