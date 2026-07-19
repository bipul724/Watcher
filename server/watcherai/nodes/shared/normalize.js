export function normalizeErrorSignature(raw) {
  const input = typeof raw === 'string' ? raw : String(raw || '');

  return input
    .replace(/0x[0-9a-fA-F]+/g, '<ADDR>')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?/g, '<TIMESTAMP>')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<IP>')
    .replace(/(\.js|\.ts|\.py|\.go|\.java):(\d+)/g, '$1:<LINE>')
    .replace(/:\d{4,5}\b/g, ':<PORT>')
    .trim();
}
