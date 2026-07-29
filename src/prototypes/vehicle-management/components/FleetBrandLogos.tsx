import React from 'react';
import {
  Bus,
  Container,
  Layers,
  Package,
  Rocket,
  Shield,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * 在租车型 KPI 右上角图标
 * - 不复刻官方品牌 Logo，改用 Lucide 图标集
 * - 对齐租赁合同 KPI：32×32 色底 + 18px 图标
 * - 主力品牌固定映射；其余按品牌名稳定哈希分配（同品牌始终一致）
 */

export type FleetBrandTone = 'violet' | 'green' | 'amber' | 'rose' | 'info' | 'neutral';

const TONES: FleetBrandTone[] = ['violet', 'green', 'amber', 'rose', 'info'];

const ICONS: LucideIcon[] = [Truck, Bus, Container, Package, Zap, Rocket, Shield];

function hashBrand(brand: string): number {
  let h = 0;
  for (let i = 0; i < brand.length; i += 1) {
    h = (h * 31 + brand.charCodeAt(i)) >>> 0;
  }
  return h;
}

const BRAND_PRESET: Record<string, { Icon: LucideIcon; tone: FleetBrandTone }> = {
  现代: { Icon: Truck, tone: 'violet' },
  苏龙: { Icon: Bus, tone: 'rose' },
  飞驰: { Icon: Zap, tone: 'amber' },
  宇通: { Icon: Bus, tone: 'info' },
  通华: { Icon: Container, tone: 'green' },
  楚风: { Icon: Package, tone: 'info' },
  跃进: { Icon: Rocket, tone: 'amber' },
  腾势: { Icon: Shield, tone: 'violet' },
  红岩: { Icon: Truck, tone: 'rose' },
};

function resolveVisual(brand: string, isOther: boolean): { Icon: LucideIcon; tone: FleetBrandTone } {
  if (isOther || !brand || brand === '其他' || brand === '未填品牌') {
    return { Icon: Layers, tone: 'neutral' };
  }
  const key = brand.trim();
  const preset = BRAND_PRESET[key];
  if (preset) return preset;
  const h = hashBrand(key);
  return {
    Icon: ICONS[h % ICONS.length],
    tone: TONES[h % TONES.length],
  };
}

export function FleetBrandIcon({
  brand,
  isOther = false,
  size = 18,
  quiet = false,
}: {
  brand: string;
  isOther?: boolean;
  size?: number;
  /** 降噪：统一中性色底，减少彩虹图标花眼 */
  quiet?: boolean;
}) {
  const resolved = resolveVisual(brand, isOther);
  const tone = quiet ? 'neutral' : resolved.tone;
  const { Icon } = resolved;
  const title = isOther || brand === '其他' ? '其他车型' : brand || '品牌';

  return (
    <span className={`va-fleet-card__icon-wrap is-${tone}`} title={title} aria-hidden>
      <Icon size={size} strokeWidth={1.75} />
    </span>
  );
}
