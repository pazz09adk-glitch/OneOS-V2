import React from 'react';
import dashboardHtml from '../../../meeting-dashboard.html?raw';
import './style.css';

export default function ManagementOpsReviewPage() {
  return (
    <main className="management-ops-review-embed">
      <iframe
        className="management-ops-review-frame"
        srcDoc={dashboardHtml}
        title="管理层经营分析会"
      />
    </main>
  );
}
