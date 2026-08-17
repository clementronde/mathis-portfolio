'use client';
import { useState } from 'react';
import { Window } from './Window';
import { AppIcon } from './icons/AppIcons';

const PHOTOGRAPHER_EMAIL = 'contact@photographe.com';
const INSTAGRAM_URL = 'https://www.instagram.com/msa.raw';

export function MailWindow() {
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const canSend = name.trim() && senderEmail.trim() && subject.trim() && message.trim();

  function handleSend() {
    if (!canSend) return;
    const body = `De : ${name} (${senderEmail})\n\n${message}`;
    const mailto = `mailto:${PHOTOGRAPHER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  function handleInstagram() {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
  }

  return (
    <Window
      id="mail"
      title="Nouveau message"
      icon={<AppIcon id="mail" size={16} />}
      chrome="frameless"
      defaultSize={{ width: 640, height: 480 }}
    >
      <div className="relative flex flex-col h-full" style={{ background: '#ffffff', color: '#1d1d1f' }}>
        <div className="flex flex-col" style={{ paddingTop: 72 }}>
          {/* Fields */}
          <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <span className="text-[14px] font-semibold shrink-0">Nom :</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: '#1d1d1f' }}
              aria-label="Votre nom"
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <span className="text-[14px] font-semibold shrink-0">Depuis :</span>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="Votre@email.com"
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: '#1d1d1f' }}
              aria-label="Votre email"
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <span className="text-[14px] font-semibold shrink-0">Sujet :</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet"
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: '#1d1d1f' }}
              aria-label="Sujet du message"
            />
          </div>
        </div>

        {/* Body */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Rédigez votre message…"
          className="flex-1 bg-transparent text-[14px] px-6 py-4 outline-none resize-none leading-relaxed"
          style={{ color: 'rgba(0,0,0,0.75)' }}
          aria-label="Corps du message"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0">
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Envoyer le message"
            className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-transform active:scale-[0.97]"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #63b3f0 0%, #2f7fe0 100%)'
                : 'rgba(0,0,0,0.15)',
              cursor: canSend ? 'pointer' : 'not-allowed',
              boxShadow: canSend ? '0 8px 20px rgba(47,127,224,0.35)' : 'none',
            }}
          >
            {sent ? 'Ouverture…' : 'Envoyer'}
          </button>
          <button
            onClick={handleInstagram}
            aria-label="Voir Instagram"
            className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-transform active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, #f0cf6b 0%, #d9a52a 100%)',
              boxShadow: '0 8px 20px rgba(217,165,42,0.35)',
            }}
          >
            Instagram
          </button>
        </div>

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
