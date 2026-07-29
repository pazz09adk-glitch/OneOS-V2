import React, { useMemo, useState, useEffect } from 'react';
import type { AnnotationSourceDocument, AnnotationViewerOptions } from '@axhub/annotation';
import { PrototypeAnnotationHost } from '../../common/prototype-annotation-host';
import type { RoleId } from './types';
import { ROLE_CONFIGS, MULTI_ROLE_OPERATOR_MAP } from './data/roles';
import { CURRENT_RELEASE_NOTE } from './mockData';
import { HeroWelcome } from './components/HeroWelcome';
import { KpiTiles } from './components/KpiTiles';
import { RoleInsightsCockpit } from './components/RoleInsightsCockpit';
import { MyTodoList } from './components/MyTodoList';
import { ApprovalEmbed } from './components/ApprovalEmbed';
import { NoticeDrawer } from './components/NoticeDrawer';
import { VersionModal } from './components/VersionModal';
import {
  isReleaseDemoAction,
  RELEASE_SEEN_STORAGE_KEY,
} from '../../common/oneos-app-shell/release-demo-bridge';
import annotationSourceDocument from './annotation-source.json';
import './styles/workbench-v2.css';

export function WorkbenchHub() {
  const [currentRoleId, setCurrentRoleId] = useState<RoleId>('bizAdmin');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('oneos-wb-new-role-v1') as RoleId | null;
    if (savedRole && ROLE_CONFIGS[savedRole]) {
      setCurrentRoleId(savedRole);
    }

    const releaseSeen = localStorage.getItem(RELEASE_SEEN_STORAGE_KEY);
    if (!releaseSeen || releaseSeen !== CURRENT_RELEASE_NOTE.version) {
      setIsVersionModalOpen(true);
    }
  }, []);

  // 「原型外壳演示」顶栏「版本更新」→ 打开本页弹窗
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!isReleaseDemoAction(e.data)) return;
      if (e.data.action === 'open') {
        setIsVersionModalOpen(true);
      }
      if (e.data.action === 'reset') {
        localStorage.removeItem(RELEASE_SEEN_STORAGE_KEY);
        setIsVersionModalOpen(true);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const handleRoleChange = (roleId: RoleId) => {
    setCurrentRoleId(roleId);
    localStorage.setItem('oneos-wb-new-role-v1', roleId);
  };

  const handleCloseVersionModal = () => {
    setIsVersionModalOpen(false);
    localStorage.setItem(RELEASE_SEEN_STORAGE_KEY, CURRENT_RELEASE_NOTE.version);
  };

  const currentRole = ROLE_CONFIGS[currentRoleId] || ROLE_CONFIGS.bizAdmin;
  const availableRoles = Object.values(ROLE_CONFIGS);

  const activeRoleIds =
    currentRole.operatorName === '王冕'
      ? MULTI_ROLE_OPERATOR_MAP['王冕']
      : [currentRoleId];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const annotationOptions = useMemo<AnnotationViewerOptions>(
    () => ({
      showToolbar: true,
      showThemeToggle: true,
      showColorFilter: true,
      emptyWhenNoData: false,
      toolbarEdge: 'right',
      currentPageId: 'workbench',
    }),
    [],
  );

  return (
    <PrototypeAnnotationHost
      source={annotationSourceDocument as AnnotationSourceDocument}
      options={annotationOptions}
    >
      <div className="v2-wb-container">
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              background: 'var(--ln-ink, #0A2540)',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 通知仅同步到「原型外壳演示」顶栏消息，工作台内不展示 */}
        <NoticeDrawer currentRole={currentRole} />

        <HeroWelcome
          currentRole={currentRole}
          availableRoles={availableRoles}
          onRoleChange={handleRoleChange}
        />

        <KpiTiles currentRoleId={currentRoleId} activeRoleIds={activeRoleIds} />

        <RoleInsightsCockpit currentRole={currentRole} activeRoleIds={activeRoleIds} />

        <div className="v2-wb-split-main">
          <MyTodoList currentRole={currentRole} onUrgeSuccessToast={showToast} />
          <ApprovalEmbed onUrgeSuccessToast={showToast} />
        </div>

        <VersionModal
          isOpen={isVersionModalOpen}
          releaseNote={CURRENT_RELEASE_NOTE}
          onClose={handleCloseVersionModal}
        />
      </div>
    </PrototypeAnnotationHost>
  );
}

export default WorkbenchHub;
