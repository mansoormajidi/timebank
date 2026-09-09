import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  onClick?: () => void;
  buttonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick'>;
  element?: 'div' | 'article';
};

function Content({ title, subtitle, meta, leading, trailing }: Pick<Props, 'title' | 'subtitle' | 'meta' | 'leading' | 'trailing'>) {
  return <>{leading}<span className="ui-list-row__copy"><strong>{title}</strong>{subtitle !== undefined && <small>{subtitle}</small>}{meta !== undefined && <span className="ui-list-row__meta">{meta}</span>}</span>{trailing}</>;
}

export function ListRow({ title, subtitle, meta, leading, trailing, className = '', onClick, buttonProps, element = 'div' }: Props) {
  const classes = `ui-list-row ${onClick ? 'ui-list-row--interactive' : ''} ${className}`.trim();
  if (onClick) return <button type="button" className={classes} onClick={onClick} {...buttonProps}><Content title={title} subtitle={subtitle} meta={meta} leading={leading} trailing={trailing}/></button>;
  if (element === 'article') return <article className={classes}><Content title={title} subtitle={subtitle} meta={meta} leading={leading} trailing={trailing}/></article>;
  return <div className={classes}><Content title={title} subtitle={subtitle} meta={meta} leading={leading} trailing={trailing}/></div>;
}
