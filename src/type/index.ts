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
  text?: string;
  image?: string;
  favicon?: string;
  highlights?: string[];
  highlightScores?: number[];
  subpages?: ExaSearchResult[];
  extras?: {
    links?: any[]
  };
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  requestId?: string;
  autopromptString?: string;
  autoDate?: string;
  resolvedSearchType?: string;
  searchType?: string;
  costDollars?: {
    total: number;
    breakDown?: any[];
    perRequestPrices?: any;
    perPagePrices?: any;
  };
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
  PLUGIN_API_KEY: string; // 添加插件API密钥
  EXA_SEARCH_TYPE?: 'keyword' | 'neural' | 'auto';
  EXA_SEARCH_NUM_RESULTS?: string; 
  EXA_SEARCH_SUMMARY?: boolean;
  EXA_SEARCH_TEXT?: boolean;
}