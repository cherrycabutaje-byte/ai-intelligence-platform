import { ChannelEvidence } from '../types/evidence';
import { Observation, Pattern } from '../types/diagnosis';

export function detectPatterns(
  evidence: ChannelEvidence,
  observations: Observation[]
): Pattern[] {
  const patterns: Pattern[] = [];

  // Pattern: Same topic, different performance
  const topTopics = evidence.topVideos.flatMap(v => v.tags.slice(0, 3));
  const bottomTopics = evidence.bottomVideos.flatMap(v => v.tags.slice(0, 3));
  const sharedTopics = topTopics.filter(t => bottomTopics.includes(t));

  if (sharedTopics.length > 0 && evidence.topPerformerAverage > 0) {
    patterns.push({
      id: 'PAT_001',
      title: 'Same topic, different performance',
      observations: observations
        .filter(o => o.statement.includes('highest-performing') || o.statement.includes('lowest-performing'))
        .map(o => o.id),
      explanation: `Top and bottom videos share tags: ${sharedTopics.slice(0, 3).join(', ')}. Topic alone does not explain the ${Math.round(evidence.topPerformerAverage / Math.max(evidence.recentPerformerAverage, 1))}x performance gap. Something else changed.`,
    });
  }

  // Pattern: Performance collapse after peak
  if (evidence.allTimeTopVideo && evidence.recentPerformerAverage > 0) {
    const collapseRatio = Math.round(
      evidence.allTimeTopVideo.views / Math.max(evidence.recentPerformerAverage, 1)
    );
    if (collapseRatio > 10) {
      patterns.push({
        id: 'PAT_002',
        title: 'Performance collapse after peak',
        observations: observations
          .filter(o => o.id === 'OBS_001' || o.id === 'OBS_002')
          .map(o => o.id),
        explanation: `"${evidence.allTimeTopVideo.title}" reached ${evidence.allTimeTopVideo.views.toLocaleString()} views. Recent videos average ${evidence.recentPerformerAverage.toLocaleString()}. That is a ${collapseRatio}x collapse. The channel's peak performance and current performance describe two different channels.`,
      });
    }
  }

  // Pattern: Channel description does not match top content
  if (evidence.channelDescription && evidence.topVideos.length > 0) {
    const descWords = evidence.channelDescription.toLowerCase().split(/\s+/);
    const topTitleWords = evidence.topVideos
      .flatMap(v => v.title.toLowerCase().split(/\s+/));
    const overlap = descWords.filter(w => w.length > 4 && topTitleWords.includes(w));

    if (overlap.length < 3) {
      patterns.push({
        id: 'PAT_003',
        title: 'Channel description does not match top content',
        observations: observations
          .filter(o => o.statement.includes('describes itself'))
          .map(o => o.id),
        explanation: `The channel description shares almost no language with the titles of its best-performing videos. The stated identity and the data identity are different.`,
      });
    }
  }

  // Pattern: Format shift
  if (evidence.topVideos.length > 0 && evidence.recentVideos.length > 0) {
    const topAvgDur = Math.round(
      evidence.topVideos.reduce((s, v) => s + v.durationSeconds, 0) / evidence.topVideos.length
    );
    const recentAvgDur = Math.round(
      evidence.recentVideos.reduce((s, v) => s + v.durationSeconds, 0) / evidence.recentVideos.length
    );
    if (Math.abs(topAvgDur - recentAvgDur) > 120) {
      patterns.push({
        id: 'PAT_004',
        title: 'Format shift between peak and recent content',
        observations: observations
          .filter(o => o.statement.includes('minutes long'))
          .map(o => o.id),
        explanation: `Top videos average ${Math.round(topAvgDur / 60)} minutes. Recent videos average ${Math.round(recentAvgDur / 60)} minutes. The format changed significantly between the channel's peak and current output.`,
      });
    }
  }

  // Pattern: Publishing stopped after performance collapse
  if (evidence.daysSinceLastUpload > 90 && evidence.driftScore > 50) {
    patterns.push({
      id: 'PAT_005',
      title: 'Publishing stopped after performance collapse',
      observations: observations
        .filter(o => o.statement.includes('not uploaded'))
        .map(o => o.id),
      explanation: `The channel went silent for ${evidence.daysSinceLastUpload} days. The silence followed a period where recent content averaged ${evidence.recentPerformerAverage.toLocaleString()} views against a proven ceiling of ${evidence.topPerformerAverage.toLocaleString()}.`,
    });
  }

  return patterns;
}
