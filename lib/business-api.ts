'use client';

export async function businessFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  const res = await fetch(path, { ...options, headers, credentials: 'same-origin' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'خطای نامشخص');
  }
  return data as T;
}
