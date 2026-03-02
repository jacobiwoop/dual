/**
 * Helper functions pour extraire et typer les query params
 */

export function getQueryString(value: any): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return undefined;
}

export function getQueryNumber(value: any, defaultValue: number = 0): number {
  const str = getQueryString(value);
  if (!str) return defaultValue;
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultValue : num;
}

export function getQueryBoolean(value: any, defaultValue: boolean = false): boolean {
  const str = getQueryString(value);
  if (!str) return defaultValue;
  return str === 'true' || str === '1';
}

export function getQueryArray(value: any): string[] {
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string');
  if (typeof value === 'string') return [value];
  return [];
}
