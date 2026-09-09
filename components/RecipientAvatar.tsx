export function avatarForName(name: string) {
  const hash = [...name].reduce((value, letter) => (Math.imul(value, 31) + letter.charCodeAt(0)) >>> 0, 0);
  return `/assets/avatars/avtr0${((hash ^ (hash >>> 16)) % 7) + 1}.svg`;
}
export function RecipientAvatar({ name, src }: { name: string; src?: string }) {
  return <img className="recipient-avatar" src={src || avatarForName(name)} alt="" aria-hidden="true" />;
}
