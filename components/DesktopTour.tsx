'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface TourStep {
  title: string;
  description: string;
  selector?: string;
  placement: 'center' | 'right' | 'top' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Bienvenue sur mon bureau',
    description: 'Ce portfolio fonctionne comme un véritable bureau. Voici les quelques gestes qui vous permettront de tout explorer.',
    placement: 'center',
  },
  {
    title: 'Des souvenirs à manipuler',
    description: 'Les éléments posés sur le bureau peuvent être déplacés et ouverts. Cliquez sur une image pour découvrir le projet auquel elle appartient.',
    selector: '[data-tour="desktop-items"]',
    placement: 'center',
  },
  {
    title: 'Les raccourcis essentiels',
    description: 'Ces widgets donnent un accès immédiat à ma bibliothèque photo et à mon formulaire de contact.',
    selector: '[data-tour="widgets"]',
    placement: 'right',
  },
  {
    title: 'Toutes les applications',
    description: 'Le dock rassemble Finder, Photos, Notes, Musique, Maps et mes outils créatifs. Une pastille indique les applications ouvertes.',
    selector: '[data-tour="dock"]',
    placement: 'top',
  },
  {
    title: 'Vous êtes prêt',
    description: 'La barre supérieure vous accompagne comme sur macOS. Ouvrez, déplacez et redimensionnez les fenêtres librement pour construire votre visite.',
    selector: '[data-tour="topbar"]',
    placement: 'bottom',
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

export function DesktopTour({ onFinish }: { onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState<Size>(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [panelSize, setPanelSize] = useState<Size>({ width: 440, height: 320 });
  const [canClose, setCanClose] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const step = TOUR_STEPS[stepIndex];

  useEffect(() => {
    const closeGuard = window.setTimeout(() => setCanClose(true), 500);
    return () => window.clearTimeout(closeGuard);
  }, []);

  useEffect(() => {
    const updateTarget = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      if (!step.selector) {
        setTargetRect(null);
        return;
      }

      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) {
        setTargetRect(null);
        return;
      }

      const rect = target.getBoundingClientRect();
      const padding = step.selector.includes('desktop-items') ? 12 : 10;
      setTargetRect({
        top: Math.max(6, rect.top - padding),
        left: Math.max(6, rect.left - padding),
        width: Math.min(window.innerWidth - 12, rect.width + padding * 2),
        height: Math.min(window.innerHeight - 12, rect.height + padding * 2),
      });
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, [step]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const measure = () => {
      setPanelSize({ width: panel.offsetWidth, height: panel.offsetHeight });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [stepIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && canClose) onFinish();
      if (event.key === 'ArrowLeft' && stepIndex > 0) setStepIndex((current) => current - 1);
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        if (stepIndex === TOUR_STEPS.length - 1) {
          if (canClose) onFinish();
          return;
        }
        setStepIndex((current) => current + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canClose, onFinish, stepIndex]);

  const panelStyle = useMemo<React.CSSProperties>(() => {
    const margin = viewport.width < 768 ? 12 : 20;
    const gap = viewport.width < 768 ? 16 : 22;
    const maxLeft = Math.max(margin, viewport.width - panelSize.width - margin);
    const maxTop = Math.max(margin, viewport.height - panelSize.height - margin);
    const centered = {
      left: Math.min(maxLeft, Math.max(margin, (viewport.width - panelSize.width) / 2)),
      top: Math.min(maxTop, Math.max(margin, (viewport.height - panelSize.height) / 2)),
    };
    if (!targetRect || !viewport.width) return centered;

    const targetRight = targetRect.left + targetRect.width;
    const targetBottom = targetRect.top + targetRect.height;
    const candidates = {
      top: {
        left: targetRect.left + (targetRect.width - panelSize.width) / 2,
        top: targetRect.top - panelSize.height - gap,
      },
      bottom: {
        left: targetRect.left + (targetRect.width - panelSize.width) / 2,
        top: targetBottom + gap,
      },
      right: {
        left: targetRight + gap,
        top: targetRect.top + (targetRect.height - panelSize.height) / 2,
      },
      left: {
        left: targetRect.left - panelSize.width - gap,
        top: targetRect.top + (targetRect.height - panelSize.height) / 2,
      },
    };
    const preferredOrder: Record<TourStep['placement'], Array<keyof typeof candidates>> = {
      top: ['top', 'right', 'left', 'bottom'],
      bottom: ['bottom', 'right', 'left', 'top'],
      right: ['right', 'bottom', 'top', 'left'],
      center: ['right', 'left', 'top', 'bottom'],
    };
    const fits = (position: { left: number; top: number }) =>
      position.left >= margin &&
      position.top >= margin &&
      position.left + panelSize.width <= viewport.width - margin &&
      position.top + panelSize.height <= viewport.height - margin;
    const selected = preferredOrder[step.placement]
      .map((placement) => candidates[placement])
      .find(fits) ?? centered;

    return {
      left: Math.min(maxLeft, Math.max(margin, selected.left)),
      top: Math.min(maxTop, Math.max(margin, selected.top)),
    };
  }, [panelSize, step.placement, targetRect, viewport]);

  const next = () => {
    if (stepIndex === TOUR_STEPS.length - 1) {
      if (canClose) onFinish();
      return;
    }
    setStepIndex((current) => current + 1);
  };

  return createPortal(
    <motion.div
      className="desktop-tour"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="desktop-tour-title"
    >
      {!targetRect && <div className="desktop-tour-shade" />}

      <AnimatePresence>
        {targetRect && (
          <motion.div
            className="desktop-tour-spotlight"
            initial={{ opacity: 0, ...targetRect }}
            animate={{ opacity: 1, ...targetRect }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      <motion.section
        ref={panelRef}
        className="desktop-tour-panel"
        data-placement={step.placement}
        style={panelStyle}
        layout="size"
        animate={{ left: panelStyle.left, top: panelStyle.top }}
        transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.8 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepIndex}
            className="desktop-tour-content"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
          <div className="desktop-tour-eyebrow">VISITE GUIDÉE</div>
          <h2 id="desktop-tour-title">{step.title}</h2>
          <p>{step.description}</p>

          <div className="desktop-tour-actions">
            <button type="button" className="desktop-tour-skip" onClick={() => canClose && onFinish()}>Passer la visite</button>
            <div className="desktop-tour-buttons">
              {stepIndex > 0 && <button type="button" onClick={() => setStepIndex((current) => current - 1)}>Retour</button>}
              <button type="button" className="desktop-tour-next" onClick={next}>
                {stepIndex === TOUR_STEPS.length - 1 ? 'Explorer' : 'Suivant'}
              </button>
            </div>
          </div>

          <div className="desktop-tour-progress">
            <span>Étape {stepIndex + 1} sur {TOUR_STEPS.length}</span>
            <div aria-hidden="true">
              {TOUR_STEPS.map((item, index) => <i key={item.title} data-active={index <= stepIndex} />)}
            </div>
          </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </motion.div>,
    document.body
  );
}
