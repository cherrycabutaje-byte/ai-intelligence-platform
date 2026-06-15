// src/types/database.ts

export type SourceStatus = 'active' | 'inactive' | 'pending';
export type SourceType = 'organic' | 'paid' | 'referral' | 'direct' | 'social';
export type AssetType = 'video' | 'blog' | 'product' | 'channel' | 'store' | 'other';
export type Platform =
  | 'YouTube'
  | 'TikTok'
  | 'Instagram'
  | 'Amazon'
  | 'Shopify'
  | 'Etsy'
  | 'Twitter'
  | 'LinkedIn'
  | 'Other';

export interface Source {
  id: number;
  platform: Platform | string;
  asset_name: string;
  asset_url: string | null;
  source_type: SourceType | string | null;
  category: string | null;
  country: string | null;
  niche: string | null;
  notes: string | null;
  asset_type: AssetType | string | null;
  status: SourceStatus;
  created_at: string;
}

export type SourceInsert = Omit<Source, 'id' | 'created_at'>;
export type SourceUpdate = Partial<SourceInsert>;

export interface DashboardKPIs {
  totalSources: number;
  totalContentAnalyses: number;
  totalProductAnalyses: number;
  averageOpportunityScore: number;
}

export interface ContentAnalysis {
  id: number;
  created_at: string;
  video_title: string | null;
  channel: string | null;
  publish_date: string | null;
  viral_score: number | null;
  opportunity_score: number | null;
  content_gap: string | null;
  next_content_idea: string | null;
  action_plan: string | null;
  report: string | null;
  platform: string | null;
  monetization_opportunity: string | null;
  viral_drivers: string | null;
  content_blueprint: string | null;
  seo_tags: string | null;
  seo_description_template: string | null;
  hook_script: string | null;
  thumbnail_strategy: string | null;
  engagement_strategy: string | null;
  algorithm_tips: string | null;
  shorts_strategy: string | null;
  collaboration_playbook: string | null;
  organic_growth_playbook: string | null;
  title_options: string | null;
  content_roadmap: string | null;
  revenue_projection_30: string | null;
  revenue_projection_60: string | null;
  revenue_projection_90: string | null;
  ceo_decision: string | null;
  ceo_reasoning: string | null;
  source_id: number | null;
  status: string | null;
}

export interface ProductAnalysis {
  id: number;
  created_at: string;
  product_title: string | null;
  platform: string | null;
  market_score: number | null;
  opportunity_score: number | null;
  product_gap: string | null;
  next_product_idea: string | null;
  growth_opportunities: string | null;
  monetization_opportunities: string | null;
  action_plan: string | null;
  report: string | null;
  source_url: string | null;
}

export interface FeedItem {
  id: number;
  type: 'content' | 'product';
  date: string;
  assetName: string | null;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  latestContent: ContentAnalysis | null;
  latestProduct: ProductAnalysis | null;
  feed: FeedItem[];
}

export interface GrowthOpportunity {
  id: number;
  created_at: string;
  content_id: number | null;
  source_id: number | null;
  opportunity_type: string | null;
  recommendation: string | null;
  priority: string | null;
  estimated_impact: string | null;
  monetization_potential: string | null;
  status: string | null;
}
