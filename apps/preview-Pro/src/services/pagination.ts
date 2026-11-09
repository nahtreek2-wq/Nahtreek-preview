export type PageMeta = {page: number; totalPages: number};

export function nextPage(meta: PageMeta): number | undefined {
  return meta.page < meta.totalPages ? meta.page + 1 : undefined;
}

export function nextCombinedPage(
  page: number,
  ...metadata: Array<PageMeta | null | undefined>
): number | undefined {
  return metadata.some(meta => meta && page < meta.totalPages)
    ? page + 1
    : undefined;
}
