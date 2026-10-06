type PageResult<T> = {
  items: T[];
  totalPages: number | null;
};

/**
 * Loads every page of a paged endpoint so search, filters and pagination can
 * run client-side over the full set. Stops at the last page, or after
 * maxPages as a safety cap.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, size: number) => Promise<PageResult<T>>,
  size = 50,
  maxPages = 40,
): Promise<T[]> {
  const all: T[] = [];
  for (let page = 0; page < maxPages; page++) {
    const result = await fetchPage(page, size);
    all.push(...result.items);
    const lastByTotals =
      result.totalPages !== null && page + 1 >= result.totalPages;
    if (lastByTotals || result.items.length < size) break;
  }
  return all;
}
