import { Ref, ref } from "vue";

import { SearchResponse, Track } from "@qify/api";

import { fetchApi } from "../api";

type UseFetchSearchResult = {
  loading: Ref<boolean>;
  fetchSearch: () => Promise<void>;
};

export const useFetchSearch = (
  input: Ref<string>,
  searchResults: Ref<Track[]>
): UseFetchSearchResult => {
  const loading = ref(false);

  return {
    loading,
    fetchSearch: async () => {
      if (!input.value) {
        return;
      }

      loading.value = true;
      const result = await fetchApi<SearchResponse>(
        "search",
        `query=${input.value}`
      );

      if (result.success) {
        searchResults.value = result.body.tracks;
      }

      loading.value = false;
    },
  };
};
