import { ref, Ref } from 'vue';

export interface InfiniteScrollOptions<T> {
  fetchFn: (cursor?: string) => Promise<{
    data: T[];
    pagination: {
      nextCursor: string | null;
      hasMore: boolean;
    };
  }>;
  limit?: number;
}

export const useInfiniteScroll = <T>(options: InfiniteScrollOptions<T>) => {
  const items: Ref<T[]> = ref([]);
  const loading = ref(false);
  const hasMore = ref(true);
  const nextCursor = ref<string | null>(null);
  const error = ref<string | null>(null);

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;
    error.value = null;

    try {
      const result = await options.fetchFn(nextCursor.value || undefined);
      
      items.value = [...items.value, ...result.data];
      nextCursor.value = result.pagination.nextCursor;
      hasMore.value = result.pagination.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load more items';
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    items.value = [];
    nextCursor.value = null;
    hasMore.value = true;
    error.value = null;
  };

  const refresh = async () => {
    reset();
    await loadMore();
  };

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    refresh,
  };
};
