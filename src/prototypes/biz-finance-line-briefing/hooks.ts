import { useCallback, useEffect, useState } from 'react';

/**
 * 根据滚动位置判定当前模块，避免 IntersectionObserver 在多段内容重叠时乱跳。
 * offset 与模块 scroll-margin-top / 顶栏高度对齐。
 */
export function useScrollSpy(sectionIds: string[], offset = 80) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    if (!sectionIds.length) return undefined;

    let frame = 0;

    const resolveActiveId = () => {
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        resolveActiveId();
      });
    };

    resolveActiveId();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [offset, sectionIds]);

  return activeId;
}

export function useScrolledPast(threshold = 120) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function usePresentationStep(total: number) {
  const [stepIndex, setStepIndex] = useState(0);
  const [presentMode, setPresentMode] = useState(false);

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(total - 1, index));
    setStepIndex(next);
  }, [total]);

  const next = useCallback(() => goTo(stepIndex + 1), [goTo, stepIndex]);
  const prev = useCallback(() => goTo(stepIndex - 1), [goTo, stepIndex]);

  return {
    stepIndex,
    presentMode,
    setPresentMode,
    goTo,
    next,
    prev,
    isFirst: stepIndex <= 0,
    isLast: stepIndex >= total - 1,
  };
}
