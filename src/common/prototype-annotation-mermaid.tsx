import { useEffect } from 'react';
import './prototype-annotation-mermaid.css';

const MERMAID_SELECTOR = 'pre code.language-mermaid';

let mermaidReady = false;
let renderQueue = Promise.resolve();

function collectShadowRoots(root: ParentNode): ShadowRoot[] {
  const roots: ShadowRoot[] = [];
  root.querySelectorAll('*').forEach((element) => {
    if (element.shadowRoot) {
      roots.push(element.shadowRoot);
      roots.push(...collectShadowRoots(element.shadowRoot));
    }
  });
  return roots;
}

function queryAllIncludingShadowRoots(selector: string, root: ParentNode = document): HTMLElement[] {
  const results: HTMLElement[] = [];
  root.querySelectorAll(selector).forEach((node) => {
    if (node instanceof HTMLElement) results.push(node);
  });
  collectShadowRoots(root).forEach((shadowRoot) => {
    results.push(...queryAllIncludingShadowRoots(selector, shadowRoot));
  });
  return results;
}

function observeDeepMutations(callback: () => void) {
  const observed = new WeakSet<Node>();

  const observeNode = (node: Node) => {
    if (!(node instanceof Element) || observed.has(node)) return;
    observed.add(node);
    const observer = new MutationObserver(callback);
    observer.observe(node, { childList: true, subtree: true });
    collectShadowRoots(node).forEach((shadowRoot) => observeNode(shadowRoot));
    node.querySelectorAll('*').forEach((child) => {
      if (child.shadowRoot) observeNode(child.shadowRoot);
    });
  };

  observeNode(document.body);
  return () => {
    // MutationObserver instances are GC'd with observed nodes on unmount.
  };
}

function scheduleMermaidRender() {
  renderQueue = renderQueue.then(async () => {
    const codes = queryAllIncludingShadowRoots(MERMAID_SELECTOR);
    if (codes.length === 0) return;

    const mermaid = (await import('mermaid')).default;
    if (!mermaidReady) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      });
      mermaidReady = true;
    }

    for (const code of codes) {
      const pre = code.parentElement;
      if (!pre || pre.dataset.mermaidRendered === 'true') continue;

      const graphDefinition = code.textContent?.trim();
      if (!graphDefinition) continue;

      pre.dataset.mermaidRendered = 'pending';
      const id = `axhub-mermaid-${Math.random().toString(36).slice(2, 10)}`;

      try {
        const { svg } = await mermaid.render(id, graphDefinition);
        const ownerDocument = pre.ownerDocument ?? document;
        const container = ownerDocument.createElement('div');
        container.className = 'axhub-mermaid-diagram';
        container.setAttribute('role', 'img');
        container.setAttribute('aria-label', '流程图');
        container.innerHTML = svg;
        pre.replaceWith(container);
      } catch (error) {
        pre.dataset.mermaidRendered = 'error';
        console.warn('[axhub-mermaid] render failed:', error);
      }
    }
  });
}

/**
 * 将标注面板 Markdown 中的 ```mermaid 代码块渲染为 SVG 流程图。
 */
export function useAnnotationMermaidRenderer() {
  useEffect(() => {
    scheduleMermaidRender();

    const onMutate = () => {
      scheduleMermaidRender();
    };

    const observer = new MutationObserver(onMutate);
    observer.observe(document.body, { childList: true, subtree: true });
    observeDeepMutations(onMutate);

    return () => observer.disconnect();
  }, []);
}
