import { ChannelEvidence } from '../types/evidence';
import { Observation } from '../types/diagnosis';

function id(i: number): string {
  return `OBS_${String(i).padStart(3, '0')}`;
}

export function generateObservations(evidence: ChannelEvidence): Observation[] {
  const obs: Observation[] = [];
  let i = 1;

  // Performance gap
  if (evidence.topPerformerAverage > 0 && evidence.recentPerformerAverage > 0) {
    obs.push({
      id: id(i++),
      statement: `Top 3 videos averaged ${evidence.topPerformerAverage.toLocaleString()} views. Most recent 5 videos averaged ${evidence.recentPerformerAverage.toLocaleString()} views.`,
      evidence: [
        `Top performer average: ${evidence.topPerformerAverage.toLocaleString()}`,
        `Recent performer average: ${evidence.recentPerformerAverage.toLocaleString()}`,
        `Gap: ${Math.round(evidence.topPerformerAverage / Math.max(evidence.recentPerformerAverage, 1))}x`,
      ],
    });
  }

  // All-time top video
  if (evidence.allTimeTopVideo) {
    obs.push({
      id: id(i++),
      statement: `The highest-performing video ever published was "${evidence.allTimeTopVideo.title}" with ${evidence.allTimeTopVideo.views.toLocaleString()} views.`,
      evidence: [
        `Title: "${evidence.allTimeTopVideo.title}"`,
        `Views: ${evidence.allTimeTopVideo.views.toLocaleString()}`,
        `Published: ${evidence.allTimeTopVideo.publishedAt.slice(0, 10)}`,
      ],
    });
  }

  // First video
  if (evidence.firstVideo) {
    obs.push({
      id: id(i++),
      statement: `The first video published was "${evidence.firstVideo.title}" with ${evidence.firstVideo.views.toLocaleString()} views on ${evidence.firstVideo.publishedAt.slice(0, 10)}.`,
      evidence: [
        `Title: "${evidence.firstVideo.title}"`,
        `Views: ${evidence.firstVideo.views.toLocaleString()}`,
        `Tags: ${evidence.firstVideo.tags.slice(0, 3).join(', ') || 'none'}`,
      ],
    });
  }

  // Top video titles and tags
  if (evidence.topVideos.length > 0) {
    obs.push({
      id: id(i++),
      statement: `The 3 highest-performing videos are: "${evidence.topVideos.map(v => v.title).join('", "')}"`,
      evidence: evidence.topVideos.map(v =>
        `"${v.title}" — ${v.views.toLocaleString()} views | tags: ${v.tags.slice(0, 3).join(', ') || 'none'}`
      ),
    });
  }

  // Bottom video titles
  if (evidence.bottomVideos.length > 0) {
    obs.push({
      id: id(i++),
      statement: `The 3 lowest-performing videos are: "${evidence.bottomVideos.map(v => v.title).join('", "')}"`,
      evidence: evidence.bottomVideos.map(v =>
        `"${v.title}" — ${v.views.toLocaleString()} views | tags: ${v.tags.slice(0, 3).join(', ') || 'none'}`
      ),
    });
  }

  // Silence
  if (evidence.daysSinceLastUpload > 60) {
    obs.push({
      id: id(i++),
      statement: `The channel has not uploaded in ${evidence.daysSinceLastUpload} days.`,
      evidence: [
        `Days since last upload: ${evidence.daysSinceLastUpload}`,
        `Last video: "${evidence.recentVideos[0]?.title ?? 'unknown'}"`,
        `Last video views: ${evidence.recentVideos[0]?.views?.toLocaleString() ?? 'unknown'}`,
      ],
    });
  }

  // Upload frequency
  if (evidence.uploadFrequencyDays > 0) {
    obs.push({
      id: id(i++),
      statement: `The channel uploaded on average every ${evidence.uploadFrequencyDays} days across ${evidence.topVideos.length + evidence.bottomVideos.length + evidence.recentVideos.length} analyzed videos.`,
      evidence: [
        `Upload frequency: every ${evidence.uploadFrequencyDays} days`,
        `Total videos on channel: ${evidence.totalVideos}`,
      ],
    });
  }

  // Channel description vs top video tags
  if (evidence.channelDescription && evidence.topTags.length > 0) {
    obs.push({
      id: id(i++),
      statement: `The channel describes itself as: "${evidence.channelDescription.slice(0, 120)}..." — Top performing video tags include: ${evidence.topTags.slice(0, 5).join(', ')}.`,
      evidence: [
        `Channel description (first 120 chars): "${evidence.channelDescription.slice(0, 120)}"`,
        `Top tags from best videos: ${evidence.topTags.slice(0, 5).join(', ')}`,
      ],
    });
  }

  // Duration pattern
  if (evidence.topVideos.length > 0 && evidence.recentVideos.length > 0) {
    const topAvgDur = Math.round(
      evidence.topVideos.reduce((s, v) => s + v.durationSeconds, 0) / evidence.topVideos.length
    );
    const recentAvgDur = Math.round(
      evidence.recentVideos.reduce((s, v) => s + v.durationSeconds, 0) / evidence.recentVideos.length
    );
    if (Math.abs(topAvgDur - recentAvgDur) > 60) {
      obs.push({
        id: id(i++),
        statement: `Top videos average ${Math.round(topAvgDur / 60)} minutes long. Recent videos average ${Math.round(recentAvgDur / 60)} minutes long.`,
        evidence: [
          `Top video average duration: ${Math.round(topAvgDur / 60)} minutes`,
          `Recent video average duration: ${Math.round(recentAvgDur / 60)} minutes`,
          `Difference: ${Math.abs(Math.round((topAvgDur - recentAvgDur) / 60))} minutes`,
        ],
      });
    }
  }

  return obs;
}
