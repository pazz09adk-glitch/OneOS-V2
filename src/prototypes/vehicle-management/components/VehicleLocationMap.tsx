import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Minus, Plus, Radio } from 'lucide-react';
import type { VehicleRecord } from '../types';
import {
  VEHICLE_MAP_GPS_POLL_MS,
  buildMapEmbedUrl,
  formatGpsTime,
  formatOperateCityShort,
  resolveGpsLocationAddress,
  resolveVehicleGpsCoords,
  simulateGpsPollCoords,
  type VehicleGpsCoords,
} from '../utils/vehicle';

const ZOOM_SPANS = [0.08, 0.04, 0.02, 0.01, 0.005, 0.0025];

function formatNowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 车辆定位地图：车辆始终居中；在线绿点 / 离线灰点；支持缩放；
 * 在线时定时模拟 GPS 轮询并跟车移动。
 */
export function MapModal({
  record,
  onClose,
}: {
  record: VehicleRecord;
  onClose: () => void;
}) {
  const initial = resolveVehicleGpsCoords(record);
  const isOffline = record.onlineStatus !== '在线';
  const [coords, setCoords] = useState<VehicleGpsCoords | null>(initial);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [liveTime, setLiveTime] = useState(formatGpsTime(record.gpsTime, '无更新时间'));
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    setCoords(resolveVehicleGpsCoords(record));
    setLiveTime(formatGpsTime(record.gpsTime, '无更新时间'));
    setZoomIndex(2);
  }, [record]);

  useEffect(() => {
    if (!coords || isOffline) {
      setPolling(false);
      return undefined;
    }
    setPolling(true);
    const timer = window.setInterval(() => {
      setCoords((prev) => {
        if (!prev) return prev;
        return simulateGpsPollCoords(prev.lat, prev.lng, Date.now());
      });
      setLiveTime(formatNowStamp());
    }, VEHICLE_MAP_GPS_POLL_MS);
    return () => {
      window.clearInterval(timer);
      setPolling(false);
    };
    // 在线打开地图期间持续轮询；离线不轮询
    // eslint-disable-next-line react-hooks/exhaustive-deps -- coords 由 interval 自更新，勿因坐标变化重启轮询
  }, [isOffline, record.id]);

  const span = ZOOM_SPANS[zoomIndex] ?? 0.02;
  const mapSrc = useMemo(
    () => (coords ? buildMapEmbedUrl(coords.lat, coords.lng, span) : ''),
    [coords, span],
  );

  if (!coords) return null;

  const title = isOffline ? `末次位置 · ${record.plateNo}` : `当前位置 · ${record.plateNo}`;
  const detailAddress = resolveGpsLocationAddress(record, '暂无详细地址');
  const cityLabel = formatOperateCityShort(record.location);
  const canZoomIn = zoomIndex < ZOOM_SPANS.length - 1;
  const canZoomOut = zoomIndex > 0;

  return (
    <div className="va-modal-mask" role="dialog" aria-modal="true" aria-labelledby="map-title">
      <div className="va-modal va-modal-map" style={{ width: 'min(720px, 100%)' }}>
        <h3 id="map-title">{title}</h3>
        {isOffline ? (
          <p className="va-map-offline-hint" role="status">
            车辆离线，灰色定位点为末次上报位置，非实时位置
          </p>
        ) : (
          <p className="va-map-live-hint" role="status">
            <Radio size={14} aria-hidden />
            {polling
              ? '车辆在线移动中，定时拉取 GPS 最新位置；定位点始终居中，可缩放'
              : '车辆在线，绿色定位点为当前位置；定位点始终居中，可缩放'}
          </p>
        )}
        <dl className="va-map-meta">
          <div>
            <dt>运营城市</dt>
            <dd>{cityLabel}</dd>
          </div>
          <div>
            <dt>详细位置</dt>
            <dd>{detailAddress}</dd>
          </div>
          <div>
            <dt>经纬度</dt>
            <dd className="tabular-nums">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</dd>
          </div>
          <div>
            <dt>{isOffline ? '末次更新' : '定位时间'}</dt>
            <dd className="tabular-nums">{liveTime}</dd>
          </div>
        </dl>

        <div
          className={`va-map-stage${isOffline ? ' is-offline' : ' is-online'}`}
          data-annotation-id="va-feat-list-map"
        >
          <iframe
            title={isOffline ? '车辆末次位置地图' : '车辆实时位置地图'}
            src={mapSrc}
            className="va-map-stage__frame"
          />
          <div
            className={`va-map-pin${isOffline ? ' is-offline' : ' is-online'}${!isOffline && polling ? ' is-tracking' : ''}`}
            aria-label={isOffline ? '离线车辆，灰色定位点' : '在线车辆，绿色定位点'}
          >
            <MapPin size={36} strokeWidth={2.25} aria-hidden />
            <span className="va-map-pin__dot" aria-hidden />
          </div>

          <div className="va-map-zoom" role="group" aria-label="地图缩放">
            <button
              type="button"
              className="va-map-zoom__btn"
              disabled={!canZoomIn}
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_SPANS.length - 1, i + 1))}
              aria-label="放大"
              title="放大"
            >
              <Plus size={16} aria-hidden />
            </button>
            <button
              type="button"
              className="va-map-zoom__btn"
              disabled={!canZoomOut}
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              aria-label="缩小"
              title="缩小"
            >
              <Minus size={16} aria-hidden />
            </button>
          </div>
        </div>

        <div className="va-modal-actions">
          <V2Button variant="secondary" size="md" onClick={onClose}>关闭</V2Button>
        </div>
      </div>
    </div>
  );
}
