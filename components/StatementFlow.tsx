'use client';
import type { Activity } from '../lib/activity';
import { FlowShell } from './FlowShell';
import { StatementView } from './StatementView';

export function StatementFlow({ activities, hidden, onClose }: { activities: Activity[]; hidden: boolean; onClose: () => void }) {
  return <FlowShell variant="transfer-compact internal-flow statement-flow" title="ردپای مالی" subtitle="گردش حساب و جزئیات تراکنش‌ها" stepKey="statement" onBack={onClose} onClose={onClose}>
    <StatementView activities={activities} hidden={hidden} />
  </FlowShell>;
}
