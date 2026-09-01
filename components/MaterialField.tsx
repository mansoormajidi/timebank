'use client';
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { persianDigits } from '../lib/forms';
import { Icon } from './Icon';
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & { label: string; value: string; error?: string; hint?: string; leading?: ReactNode; trailing?: ReactNode };
export function MaterialField({ label, value, error, hint, leading, trailing, type = 'text', id, className = '', ...props }: Props) {
  const generated = useId();
  const fieldId = id || generated;
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return <div className={`material-field ${error ? 'has-error' : ''} ${className}`}>
    <div className={`material-control ${focused || value.length ? 'is-floating' : ''} ${leading ? 'has-leading' : ''}`}>
      {leading && <span className="field-leading">{leading}</span>}
      <input {...props} id={fieldId} value={persianDigits(value)} type={type === 'password' && visible ? 'text' : type} aria-invalid={!!error} aria-describedby={error || hint ? `${fieldId}-help` : undefined} onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }} />
      <label htmlFor={fieldId}>{label}</label>
      {trailing ? <span className="field-trailing custom-trailing">{trailing}</span> : type === 'password' ? <button type="button" className={`field-trailing ${visible ? '' : 'is-hidden'}`} aria-label={`${visible ? 'پنهان کردن' : 'نمایش'} ${label}`} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name="eye" size={21} /></button> : null}
    </div>
    {(error || hint) && <p id={`${fieldId}-help`} className="field-help" role={error ? 'alert' : undefined}>{error || hint}</p>}
  </div>;
}
