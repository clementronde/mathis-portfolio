export function encodeSrc(rawPath: string): string {
  if (!rawPath) return '';
  const prefix = rawPath.startsWith('/') ? '/' : '';
  return (
    prefix +
    (prefix ? rawPath.slice(1) : rawPath)
      .split('/')
      .map(encodeURIComponent)
      .join('/')
  );
}
