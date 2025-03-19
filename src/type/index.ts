/**
 * @description: This file contains all the typescript interfaces used in the application.
 */

// Exa Search API
export interface ExaSearchResult {
  title: string;
  url: string;
  publishedDate: string | null;
  author: string | null;
  score: number | null;
  id: string;
  summary: string;
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
}

export interface ExaSearchParams {
  query: string;
  type?: 'keyword' | 'neural' | 'auto';
  numResults?: number;
  contents?: {
    summary?: boolean;
    text?: boolean;
  };
}

export interface Settings {
  EXA_API_KEY: string;
  EXA_SEARCH_TYPE?: 'keyword' | 'neural' | 'auto';
  EXA_SEARCH_NUM_RESULTS?: number;
  EXA_SEARCH_SUMMARY?: boolean;
  EXA_SEARCH_TEXT?: boolean;
}