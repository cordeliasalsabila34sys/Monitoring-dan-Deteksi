export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`crisiswatch_unj_salt::${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function formatNumberID(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDateTimeID(isoOrLabel: string): string {
  const parsed = Date.parse(isoOrLabel);
  if (Number.isNaN(parsed)) {
    return isoOrLabel;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(parsed));
}
