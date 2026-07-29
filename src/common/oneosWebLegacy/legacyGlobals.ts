import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as antd from 'antd';
import {
  formatMoney,
  formatMoneyYuan,
  formatMoneyWithUnit,
  formatNumber,
  formatInteger,
} from '../format-number.js';

declare global {
  interface Window {
    React: typeof React;
    ReactDOM: typeof ReactDOM;
    antd: typeof antd;
    __oneosFormatNumber: typeof formatNumber;
    __oneosFormatMoney: typeof formatMoney;
    __oneosFormatMoneyYuan: typeof formatMoneyYuan;
    __oneosFormatMoneyWithUnit: typeof formatMoneyWithUnit;
    __oneosFormatInteger: typeof formatInteger;
  }
}

export function ensureOneosWebLegacyGlobals(): void {
  if (typeof window === 'undefined') return;
  window.React = React;
  window.ReactDOM = ReactDOM;
  window.antd = antd;
  window.__oneosFormatNumber = formatNumber;
  window.__oneosFormatMoney = formatMoney;
  window.__oneosFormatMoneyYuan = formatMoneyYuan;
  window.__oneosFormatMoneyWithUnit = formatMoneyWithUnit;
  window.__oneosFormatInteger = formatInteger;
}

// Legacy jsx 可能在模块顶层使用 React.createElement，须在页面 import 之前完成注入。
ensureOneosWebLegacyGlobals();
