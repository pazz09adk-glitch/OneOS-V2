import React from 'react';
import { CHAIN_NAV } from './chainIds';

/** 业财条线页间跳转条（演示串通，非侧栏套娃） */
export function BfclChainNav({ current }: { current: string }) {
  return (
    <nav className="bfcl-chain-nav" aria-label="业财闭环导航">
      <span className="bfcl-chain-nav__label">业财闭环</span>
      {CHAIN_NAV.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={item.id === current ? 'is-active' : undefined}
          aria-current={item.id === current ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
