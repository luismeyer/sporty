export const filterNullish = <T>(a: (T | undefined)[]) =>
  a.filter((i): i is T => Boolean(i));
