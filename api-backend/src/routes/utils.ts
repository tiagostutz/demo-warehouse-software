export const serializeNonDefaultTypes = (obj: any) =>
  JSON.parse(
    JSON.stringify(obj, (_, v) =>
      typeof v === 'bigint' ? parseInt(v.toString(), 10) : v
    )
  );
