import type { CSSProperties } from 'react';

export const icons = {
  bell: 'imgBellSimple', eye: 'imgEye', plus: 'imgPlus', numbers: 'imgShareNetwork',
  statement: 'imgFileText', transfer: 'imgVector', close: 'imgX', chevron: 'imgChevronLeft1',
  lease: 'imgScroll', mosque: 'imgMosque', receipt: 'imgReceipt', card: 'imgCreditCard',
  blocked: 'imgProhibitInset', auction: 'imgCoinVertical', chair: 'imgOfficeChair',
  accounts: 'imgCardholder', home: 'imgGroup2', logo: 'imgGroup1',
} as const;
export type IconName = keyof typeof icons;
export function Icon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  const extension = name === 'lease' || name === 'accounts' ? 'png' : 'svg';
  return <img aria-hidden="true" alt="" width={size} height={size} className={`icon ${className}`} style={{ '--icon-size': `${size}px` } as CSSProperties} src={`/assets/${icons[name]}.${extension}`} />;
}
