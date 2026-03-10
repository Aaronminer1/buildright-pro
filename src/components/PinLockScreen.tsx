import { useState, useEffect, useCallback } from 'react';
import { HardHat } from 'lucide-react';
import { isPinEnabled, verifyPin } from '../db/pin';

interface PinLockScreenProps {
  onUnlocked: () => void;
}

export function PinLockScreen({ onUnlocked }: PinLockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const submit = useCallback(async (value: string) => {
    const ok = await verifyPin(value);
    if (ok) {
      onUnlocked();
    } else {
      setShake(true);
      setError('Incorrect PIN');
      setPin('');
      setTimeout(() => {
        setShake(false);
        setError('');
      }, 900);
    }
  }, [onUnlocked]);

  const press = useCallback((digit: string) => {
    setError('');
    setPin(prev => {
      const next = prev + digit;
      if (next.length === 4) {
        setTimeout(() => submit(next), 80);
        return next;
      }
      return next;
    });
  }, [submit]);

  const del = () => setPin(prev => prev.slice(0, -1));

  // Keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') del();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [press]);

  const KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','⌫'],
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
            <HardHat size={32} className="text-white" />
          </div>
          <p className="text-white font-bold text-lg tracking-wide">BuildRight Pro</p>
          <p className="text-slate-400 text-sm">Enter your PIN to continue</p>
        </div>

        {/* Dots */}
        <div className={`flex gap-4 transition-transform ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                pin.length > i
                  ? 'bg-amber-400 border-amber-400 scale-110'
                  : 'bg-transparent border-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Error */}
        <div className="h-5">
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.flat().map((k, i) => {
            if (!k) return <div key={i} />;
            return (
              <button
                key={i}
                onClick={() => k === '⌫' ? del() : press(k)}
                className={`h-16 rounded-2xl text-xl font-semibold transition-all
                  active:scale-95 focus:outline-none ${
                  k === '⌫'
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-slate-700 text-white hover:bg-slate-600 active:bg-amber-500'
                }`}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-10px); }
          40%      { transform: translateX(10px); }
          60%      { transform: translateX(-8px); }
          80%      { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

export function usePinGate() {
  const [locked, setLocked] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    isPinEnabled().then(enabled => setLocked(enabled));
  }, []);

  const unlock = () => setLocked(false);

  return { locked, unlock };
}
