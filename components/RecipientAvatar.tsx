const tones = ['sage', 'slate', 'sand', 'navy'];
export function RecipientAvatar({ name, initials }: { name: string; initials?: string }) {
  const hash = [...name].reduce((value, letter) => (Math.imul(value, 31) + letter.charCodeAt(0)) >>> 0, 0);
  const tone = ((hash ^ (hash >>> 16)) >>> 0) % tones.length;
  const letters = initials || name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join(' ');
  return <span className={`recipient-initials avatar-${tones[tone]}`} aria-hidden="true">{letters}</span>;
}
