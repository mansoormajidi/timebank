'use client';
import { FlowShell } from './FlowShell';
import { Icon } from './Icon';
import { ActionButton } from './ui/ActionButton';

export function NavigationPage({ kind, onClose }: { kind: 'assistant' | 'support'; onClose: () => void }) {
  const assistant = kind === 'assistant';
  return <FlowShell variant="transfer-compact internal-flow navigation-page" title={assistant ? 'دستیار تایم' : 'پشتیبانی'} subtitle={assistant ? 'همراه هوشمند شما برای پیدا کردن سریع‌تر خدمات' : 'مسیرهای ارتباط و پاسخ به پرسش‌های شما'} stepKey={kind} onBack={onClose} onClose={onClose}>
    <section className="navigation-feature"><span><Icon name={kind} size={34}/></span><h2>{assistant ? 'دستیار شخصی تایم‌بانک' : 'همیشه کنار شما هستیم'}</h2><p>{assistant ? 'به‌زودی می‌توانید با یک گفت‌وگوی ساده، خدمت مناسب را پیدا کنید و مراحل آن را پیش ببرید.' : 'مرکز راهنما، گفت‌وگوی آنلاین و پیگیری درخواست‌ها به‌زودی از همین بخش در دسترس خواهد بود.'}</p><span className="phase-badge">به‌زودی</span></section>
    <div className="navigation-suggestions">{(assistant ? ['پیدا کردن بهترین روش جابه‌جایی', 'راهنمای پرداخت قبض', 'بررسی ردپای مالی'] : ['پرسش‌های پرتکرار', 'گفت‌وگو با پشتیبان', 'پیگیری درخواست']).map(item => <button key={item} disabled><span>{item}</span><Icon name="chevron" size={15}/></button>)}</div>
    <ActionButton variant="secondary" shape="pill" className="secondary-button" onClick={onClose}>بازگشت به خانه</ActionButton>
  </FlowShell>;
}
