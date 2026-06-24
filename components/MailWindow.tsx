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
      
      defaultSize={{ width: 640, height: 480 }}
    >
      <div className="flex flex-col h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>
        {/* Mail toolbar */}
        <div
          className="flex items-center gap-2 px-4 h-10 shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', background: '#f9f9f9' }}
        >
          <span className="text-[12px]" style={{ color: 'rgba(0,0,0,0.35)' }}>Brouillon enregistré</span>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Joindre un fichier" className="transition-colors" style={{ color: 'rgba(0,0,0,0.4)' }}>
              <Paperclip size={15} />
            </button>
            <button
              onClick={handleSend}
              aria-label="Envoyer le message"
              disabled={!subject.trim() || !message.trim()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all"
              style={{
                background: subject.trim() && message.trim() ? '#007AFF' : 'rgba(0,0,0,0.08)',
                color: subject.trim() && message.trim() ? '#fff' : 'rgba(0,0,0,0.3)',
                cursor: subject.trim() && message.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={12} />
              {sent ? 'Ouverture...' : 'Envoyer'}
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-4 py-3 space-y-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <span className="text-[13px] w-12 text-right shrink-0" style={{ color: 'rgba(0,0,0,0.4)' }}>À</span>
            <input
              type="text"
              value={PHOTOGRAPHER_EMAIL}
              readOnly
              className="flex-1 bg-transparent text-[13px] outline-none cursor-default"
              style={{ color: 'rgba(0,0,0,0.65)' }}
              aria-label="Destinataire"
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <span className="text-[13px] w-12 text-right shrink-0" style={{ color: 'rgba(0,0,0,0.4)' }}>Objet</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Votre objet…"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: '#1d1d1f' }}
              aria-label="Objet du message"
            />
          </div>
        </div>

        {/* Body */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message…"
          className="flex-1 bg-transparent text-[13px] p-4 outline-none resize-none leading-relaxed"
          style={{ color: 'rgba(0,0,0,0.75)' }}
          aria-label="Corps du message"
        />

        {sent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-[13px] px-5 py-3 rounded-xl shadow-xl" style={{ background: 'rgba(0,0,0,0.75)', color: '#fff' }}>
              Client mail ouvert ✓
            </div>
          </div>
        )}
      </div>
    </Window>
  );
}
