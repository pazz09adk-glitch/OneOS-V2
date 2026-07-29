import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

export interface RenderReactResult {
  container: HTMLDivElement;
  unmount: () => Promise<void>;
}

export async function renderReact(element: React.ReactElement): Promise<RenderReactResult> {
  const container = document.createElement('div');
  const root: Root = createRoot(container);
  document.body.appendChild(container);

  await act(async () => {
    root.render(element);
  });

  return {
    container,
    async unmount() {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

export async function click(button: HTMLButtonElement): Promise<void> {
  await act(async () => {
    button.click();
  });
}

export function buttonByName(scope: ParentNode, name: string): HTMLButtonElement {
  const button = Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find(
    (candidate) => (
      candidate.getAttribute('aria-label') ?? candidate.textContent?.trim()
    ) === name,
  );

  if (!button) {
    throw new Error(`Could not find button with accessible name "${name}"`);
  }

  return button;
}
