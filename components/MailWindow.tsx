'use client';
import { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';

const PHOTOGRAPHER_EMAIL = 'contact@photographe.com';

export function MailWindow() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!subject.trim() || !message.trim()) return;
    const mailto = `mailto:${PHOTOGRAPHER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(mailto, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <Window
      id="mail"
      title="Nouveau message"
      icon={<AppIcon id="mail" size={16} />}
      defaultPosition={{ x: 160, y: 80 }}
      defaultSize={{ width: 640, height: 480 }}
    >
      <div className="flex flex-col h-full text-white">
        {/* Mail toolbar */}
        <div
          className="flex items-center gap-2 px-4 h-10 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="text-[12px] text-white/40">Brouillon enregistré</span>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Joindre un fichier" className="text-white/40 hover:text-white/70 transition-colors">
              <Paperclip size={15} />
            </button>
            <button
              onClick={handleSend}
              aria-label="Envoyer le message"
              disabled={!subject.trim() || !message.trim()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                subject.trim() && message.trim()
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <Send size={12} />
              {sent ? 'Ouverture...' : 'Envoyer'}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-4 py-3 space-y-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[13px] text-white/40 w-12 text-right shrink-0">À</span>
            <input
              type="text"
              value={PHOTOGRAPHER_EMAIL}
              readOnly
              className="flex-1 bg-transparent text-[13px] text-white/70 outline-none cursor-default"
              aria-label="Destinataire"
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="text-[13px] text-white/40 w-12 text-right shrink-0">Objet</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Votre objet…"
              className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/25"
              aria-label="Objet du message"
            />
          </div>
        </div>

        {/* Body */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 bg-transparent text-[13px] text-white/85 p-4 outline-none resize-none placeholder:text-white/25 leading-relaxed"
          aria-label="Corps du message"
        />

        {sent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 text-white text-[13px] px-5 py-3 rounded-xl shadow-xl">
              Client mail ouvert ✓
            </div>
          </div>
        )}
      </div>
    </Window>
  );
}
