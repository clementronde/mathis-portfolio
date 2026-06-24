'use client';
import { useEffect, useState } from 'react';
import { Wifi, Battery, Search } from 'lucide-react';

export function TopBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      );
      setDate(
        now.toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      );
    }
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 h-7 text-white text-[13px] select-none"
      style={{
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Left — Apple menu style */}
      <div className="flex items-center gap-4">
        <span className="font-semibold text-[15px] leading-none">⌘</span>
        <span className="font-medium opacity-90">Portfolio</span>
        <span className="opacity-60 hidden sm:inline">Fichier</span>
        <span className="opacity-60 hidden sm:inline">Présentation</span>
        <span className="opacity-60 hidden md:inline">Aller</span>
      </div>

      {/* Right — status icons */}
      <div className="flex items-center gap-3 opacity-90">
        <Wifi size={13} aria-label="Wifi" />
        <Battery size={13} aria-label="Batterie" />
        <Search size={13} aria-label="Spotlight" />
        <span className="hidden sm:inline opacity-80">{date}</span>
        <span className="font-medium">{time}</span>
      </div>
    </div>
  );
}
