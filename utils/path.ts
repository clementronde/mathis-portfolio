export function encodeSrc(rawPath: string): string {
  if (!rawPath) return '';
  // Normalize to NFC so NFD filenames (macOS HFS+) match what git/Vercel deploy
  const path = rawPath.normalize('NFC');
  const prefix = path.startsWith('/') ? '/' : '';
  return (
    prefix +
    (prefix ? path.slice(1) : path)
      .split('/')
      .map(encodeURIComponent)
      .join('/')
  );
}
