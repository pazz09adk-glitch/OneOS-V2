import { useEffect, type RefObject } from 'react';

function isInsideContainers(
  target: EventTarget | null,
  containers: Array<RefObject<HTMLElement | null>>,
): boolean {
  const node = target as Node | null;
  if (!node) return false;
  return containers.some((ref) => ref.current?.contains(node));
}

export function useDismissOnFocusOutside(
  open: boolean,
  containerRef: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return;

    const containers = Array.isArray(containerRef) ? containerRef : [containerRef];

    const closeIfOutside = (target: EventTarget | null) => {
      if (!isInsideContainers(target, containers)) {
        onDismiss();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      closeIfOutside(event.target);
    };

    const handleFocusIn = () => {
      window.requestAnimationFrame(() => {
        closeIfOutside(document.activeElement);
      });
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, [open, onDismiss, containerRef]);
}
