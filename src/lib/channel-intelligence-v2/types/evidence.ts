export interface VideoData {
  videoId: string;
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  durationSeconds: number;
  tags: string[];
  categoryId: string;
  publishedAt: string;
}

export interface ChannelEvidence {
  channelId: string;
  channelTitle: string;
  channelDescription: string;
  subscribers: number;
  totalVideos: number;
  totalViews: number;
  channelStartDate: string;
  country: string;
  daysSinceLastUpload: number;
  uploadFrequencyDays: number;
  averageViews: number;
  topPerformerAverage: number;
  recentPerformerAverage: number;
  gapRatio: number;
  driftScore: number;
  topVideos: VideoData[];
  bottomVideos: VideoData[];
  recentVideos: VideoData[];
  allTimeTopVideo: VideoData | null;
  firstVideo: VideoData | null;
  topTags: string[];
  allTags: string[];
  allCategories: string[];
  shortFormCount: number;
  longFormCount: number;
  avgDurationSeconds: number;
}

export interface EvidenceValidation {
  valid: boolean;
  score: number;
  reason: string;
  missingEvidence: string[];
}
