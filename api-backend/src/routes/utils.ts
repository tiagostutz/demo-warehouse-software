export const serializeNonDefaultTypes = (obj: any) => JSON.parse(
  JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v)),
);
