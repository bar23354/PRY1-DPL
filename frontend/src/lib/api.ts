export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = (await response.json()) as T;

  if (!response.ok) {
    const maybeError = data as { error?: { message?: string } };
    throw new Error(maybeError.error?.message ?? `Request failed with status ${response.status}`);
  }

  return data;
}
