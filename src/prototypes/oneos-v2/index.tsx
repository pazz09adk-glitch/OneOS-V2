/**
 * @name OneOS V2 全局规范示范与展厅
 * 附加：?view=form-kit → 统一表单控件套件预览
 *       ?view=form → 定稿结构化工单表单页母版
 */
import React, { useEffect, useState } from 'react';
import DesignSystemShowcase from './DesignSystemShowcase';
import FormKitApp from '../oneos-v2-form-kit/index';
import H5VehicleAssetsApp from '../oneos-v2-h5-vehicle-assets/H5VehicleAssetsApp';
import { FaultDispositionForm } from '../lease-contract-redesign/FaultDispositionForm';
import { readStoredOneOsTheme } from '../../common/oneos-app-shell';

function readView(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('view');
}

export default function OneOsV2Entry() {
  const [view, setView] = useState<string | null>(() => readView());
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const q = new URLSearchParams(window.location.search);
    const t = q.get('oneosTheme') || q.get('mode');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return readStoredOneOsTheme() === 'dark';
  });

  useEffect(() => {
    const sync = () => setView(readView());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ONEOS_THEME_CHANGE') {
        setIsDark(e.data.theme === 'dark');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (view === 'form-kit') {
    return <FormKitApp />;
  }

  if (view === 'form' || view === 'form-page') {
    return <FaultDispositionForm isDark={isDark} />;
  }

  if (view === 'h5-vehicle' || view === 'h5') {
    return <H5VehicleAssetsApp />;
  }

  return <DesignSystemShowcase />;
}
