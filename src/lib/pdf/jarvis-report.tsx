import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0f1117',
    padding: 48,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2d3a',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#00d4ff',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 8,
    color: '#4a5568',
    letterSpacing: 3,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportLabel: {
    fontSize: 8,
    color: '#4a5568',
    letterSpacing: 2,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  // Channel info
  channelBlock: {
    backgroundColor: '#1a1d27',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2a2d3a',
  },
  channelName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  channelMeta: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f1117',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 3,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  statValueRed: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#ef4444',
  },
  statValueYellow: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#f59e0b',
  },
  healthBadge: {
    backgroundColor: '#7f1d1d',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  healthText: {
    fontSize: 8,
    color: '#fca5a5',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  // Section
  section: {
    marginBottom: 20,
    backgroundColor: '#1a1d27',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2d3a',
  },
  sectionCyan: {
    marginBottom: 20,
    backgroundColor: '#1a1d27',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#164e63',
  },
  sectionPurple: {
    marginBottom: 20,
    backgroundColor: '#1a1d27',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  sectionYellow: {
    marginBottom: 20,
    backgroundColor: '#1a1d27',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#78350f',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionIcon: {
    fontSize: 10,
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    letterSpacing: 2,
  },
  bodyText: {
    fontSize: 10,
    color: '#d1d5db',
    lineHeight: 1.6,
  },
  // Evidence
  evidenceItem: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 6,
  },
  evidenceDot: {
    fontSize: 9,
    color: '#00d4ff',
    marginTop: 1,
  },
  evidenceText: {
    fontSize: 9,
    color: '#9ca3af',
    flex: 1,
    lineHeight: 1.5,
  },
  // Mechanism
  mechanismCard: {
    backgroundColor: '#0f1117',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  mechanismHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mechanismType: {
    fontSize: 7,
    color: '#a78bfa',
    backgroundColor: '#2e1065',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  mechanismStrength: {
    fontSize: 9,
    color: '#a78bfa',
    fontFamily: 'Helvetica-Bold',
  },
  mechanismTranslation: {
    fontSize: 10,
    color: '#ffffff',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  // Contradiction
  contradictionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  contradictionBox: {
    flex: 1,
    backgroundColor: '#0f1117',
    borderRadius: 6,
    padding: 10,
  },
  contradictionLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 4,
    letterSpacing: 1,
  },
  contradictionText: {
    fontSize: 9,
    color: '#d1d5db',
    lineHeight: 1.5,
  },
  contradictionInsight: {
    backgroundColor: '#451a03',
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  contradictionInsightText: {
    fontSize: 9,
    color: '#fcd34d',
    lineHeight: 1.5,
  },
  // Blind spot
  blindSpotCard: {
    backgroundColor: '#0c2231',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00d4ff',
  },
  blindSpotText: {
    fontSize: 10,
    color: '#ffffff',
    lineHeight: 1.6,
    fontFamily: 'Helvetica-Bold',
  },
  // Hypothesis
  hypothesisCard: {
    backgroundColor: '#0f1117',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  hypothesisText: {
    fontSize: 10,
    color: '#d1d5db',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  hypothesisConfidence: {
    fontSize: 8,
    color: '#6b7280',
  },
  confidenceBar: {
    height: 3,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    marginTop: 4,
  },
  confidenceFill: {
    height: 3,
    backgroundColor: '#00d4ff',
    borderRadius: 2,
  },
  // Videos
  videosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  videoColumn: {
    flex: 1,
    backgroundColor: '#1a1d27',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a2d3a',
  },
  videoColumnTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    letterSpacing: 2,
    marginBottom: 10,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 6,
  },
  videoRank: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#00d4ff',
    width: 16,
  },
  videoRankRed: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ef4444',
    width: 16,
  },
  videoTitle: {
    fontSize: 8,
    color: '#d1d5db',
    flex: 1,
    lineHeight: 1.4,
  },
  videoViews: {
    fontSize: 8,
    color: '#10b981',
    fontFamily: 'Helvetica-Bold',
  },
  videoViewsRed: {
    fontSize: 8,
    color: '#ef4444',
    fontFamily: 'Helvetica-Bold',
  },
  // Cost of drift
  driftRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  driftBox: {
    flex: 1,
    backgroundColor: '#0f1117',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  driftLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 4,
    letterSpacing: 1,
  },
  driftValueGreen: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#10b981',
  },
  driftValueRed: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ef4444',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 12,
  },
  footerLeft: {
    fontSize: 7,
    color: '#374151',
  },
  footerRight: {
    fontSize: 7,
    color: '#374151',
  },
  confidential: {
    fontSize: 7,
    color: '#374151',
    letterSpacing: 2,
  },
  strategicTension: {
    fontSize: 10,
    color: '#d1d5db',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
});

interface VideoData {
  title: string;
  views: number;
}

interface CoreMechanism {
  name: string;
  mechanismType: string;
  creatorTranslation: string;
  mechanismStrength: number;
}

interface Hypothesis {
  explanation: string;
  confidence: number;
}

interface Contradiction {
  creatorBelief: string;
  audienceBehavior: string;
  insight: string;
}

interface BlindSpot {
  insight: string;
  confidence: number;
}

interface Evidence {
  averageViews: number;
  topPerformerAverage: number;
  recentPerformerAverage: number;
  gapRatio: number;
  driftScore: number;
  topVideos: VideoData[];
  bottomVideos: VideoData[];
}

interface Intelligence {
  executiveSummary: string;
  evidence: string[];
  patterns: any[];
  hypotheses: Hypothesis[];
  coreMechanisms: CoreMechanism[];
  contradictions: Contradiction[];
  blindSpots: BlindSpot[];
  missingEvidence: string[];
  strategicTension: string;
}

interface JARVISReportProps {
  channelName: string;
  subscribers: number;
  totalVideos: number;
  lastUploadDays: number;
  overallHealth: string;
  evidence: Evidence;
  intelligence: Intelligence;
  generatedAt: string;
}

export function JARVISReport({
  channelName,
  subscribers,
  totalVideos,
  lastUploadDays,
  overallHealth,
  evidence,
  intelligence,
  generatedAt,
}: JARVISReportProps) {
  const lossPercent = evidence.topPerformerAverage > 0
    ? Math.round((1 - evidence.recentPerformerAverage / evidence.topPerformerAverage) * 100)
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoArea}>
            <View>
              <Text style={styles.logoText}>JARVIS</Text>
              <Text style={styles.logoSubtext}>CHANNEL INTELLIGENCE</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportLabel}>INTELLIGENCE REPORT</Text>
            <Text style={styles.reportDate}>{generatedAt}</Text>
          </View>
        </View>

        {/* Channel Block */}
        <View style={styles.channelBlock}>
          <Text style={styles.channelName}>{channelName}</Text>
          <Text style={styles.channelMeta}>
            {subscribers.toLocaleString()} subscribers · {totalVideos} total videos
            {lastUploadDays > 0 ? ` · ${lastUploadDays} days since last upload` : ''}
          </Text>
          <View style={styles.healthBadge}>
            <Text style={styles.healthText}>{overallHealth.toUpperCase()}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>AVG VIEWS</Text>
              <Text style={styles.statValue}>{evidence.averageViews.toLocaleString()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>BEST CONTENT</Text>
              <Text style={styles.statValue}>{evidence.topPerformerAverage.toLocaleString()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RECENT CONTENT</Text>
              <Text style={styles.statValueRed}>{evidence.recentPerformerAverage.toLocaleString()}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>GAP RATIO</Text>
              <Text style={styles.statValueYellow}>{evidence.gapRatio}x</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DRIFT SCORE</Text>
              <Text style={styles.statValueRed}>{evidence.driftScore}%</Text>
            </View>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.sectionCyan}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>INTELLIGENCE SUMMARY</Text>
          </View>
          <Text style={styles.bodyText}>{intelligence.executiveSummary}</Text>
        </View>

        {/* Cost of Drift */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>COST OF DRIFT — -{lossPercent}% PERFORMANCE GAP</Text>
          </View>
          <View style={styles.driftRow}>
            <View style={styles.driftBox}>
              <Text style={styles.driftLabel}>BEST CONTENT AVERAGE</Text>
              <Text style={styles.driftValueGreen}>{evidence.topPerformerAverage.toLocaleString()}</Text>
            </View>
            <View style={styles.driftBox}>
              <Text style={styles.driftLabel}>RECENT CONTENT AVERAGE</Text>
              <Text style={styles.driftValueRed}>{evidence.recentPerformerAverage.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Core Mechanisms */}
        {intelligence.coreMechanisms.length > 0 && (
          <View style={styles.sectionPurple}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WHAT YOUR CONTENT IS ACTUALLY DOING</Text>
            </View>
            {[...intelligence.coreMechanisms]
              .sort((a, b) => b.mechanismStrength - a.mechanismStrength)
              .map((m, i) => (
                <View key={i} style={styles.mechanismCard}>
                  <View style={styles.mechanismHeader}>
                    <Text style={styles.mechanismType}>{m.mechanismType.toUpperCase()}</Text>
                    <Text style={styles.mechanismStrength}>Strength: {m.mechanismStrength}%</Text>
                  </View>
                  <Text style={styles.mechanismTranslation}>{m.creatorTranslation}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Hypotheses */}
        {intelligence.hypotheses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>POSSIBLE EXPLANATIONS</Text>
            </View>
            {intelligence.hypotheses.map((h, i) => (
              <View key={i} style={styles.hypothesisCard}>
                <Text style={styles.hypothesisText}>{h.explanation}</Text>
                <Text style={styles.hypothesisConfidence}>Confidence: {h.confidence}%</Text>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${h.confidence}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer Page 1 */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>JARVIS Channel Intelligence · Confidential</Text>
          <Text style={styles.confidential}>CONFIDENTIAL</Text>
          <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>

        {/* Header Page 2 */}
        <View style={styles.header}>
          <Text style={styles.logoText}>JARVIS</Text>
          <Text style={styles.reportLabel}>{channelName} · CONTINUED</Text>
        </View>

        {/* Contradictions */}
        {intelligence.contradictions.length > 0 && (
          <View style={styles.sectionYellow}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WHAT THE DATA CONTRADICTS</Text>
            </View>
            {intelligence.contradictions.map((c, i) => (
              <View key={i}>
                <View style={styles.contradictionGrid}>
                  <View style={styles.contradictionBox}>
                    <Text style={styles.contradictionLabel}>WHAT THE CHANNEL SAYS</Text>
                    <Text style={styles.contradictionText}>{c.creatorBelief}</Text>
                  </View>
                  <View style={styles.contradictionBox}>
                    <Text style={styles.contradictionLabel}>WHAT THE DATA SHOWS</Text>
                    <Text style={styles.contradictionText}>{c.audienceBehavior}</Text>
                  </View>
                </View>
                <View style={styles.contradictionInsight}>
                  <Text style={styles.contradictionInsightText}>{c.insight}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Blind Spots */}
        {intelligence.blindSpots.length > 0 && (
          <View style={styles.sectionCyan}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WHAT JARVIS CANNOT IGNORE</Text>
            </View>
            {intelligence.blindSpots.map((b, i) => (
              <View key={i} style={styles.blindSpotCard}>
                <Text style={styles.blindSpotText}>{b.insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Strategic Tension */}
        {intelligence.strategicTension && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>THE STRATEGIC TENSION</Text>
            </View>
            <Text style={styles.strategicTension}>{intelligence.strategicTension}</Text>
          </View>
        )}

        {/* Evidence */}
        {intelligence.evidence.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>EVIDENCE ON RECORD</Text>
            </View>
            {intelligence.evidence.map((fact, i) => (
              <View key={i} style={styles.evidenceItem}>
                <Text style={styles.evidenceDot}>•</Text>
                <Text style={styles.evidenceText}>{fact}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Videos */}
        <View style={styles.videosRow}>
          <View style={styles.videoColumn}>
            <Text style={styles.videoColumnTitle}>WHAT WORKS</Text>
            {evidence.topVideos.slice(0, 3).map((v, i) => (
              <View key={i} style={styles.videoItem}>
                <Text style={styles.videoRank}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoTitle}>{v.title}</Text>
                  <Text style={styles.videoViews}>{v.views.toLocaleString()} views</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.videoColumn}>
            <Text style={styles.videoColumnTitle}>WHAT DOES NOT WORK</Text>
            {evidence.bottomVideos.slice(0, 3).map((v, i) => (
              <View key={i} style={styles.videoItem}>
                <Text style={styles.videoRankRed}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoTitle}>{v.title}</Text>
                  <Text style={styles.videoViewsRed}>{v.views.toLocaleString()} views</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Missing Evidence */}
        {intelligence.missingEvidence.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WHAT JARVIS CANNOT DETERMINE</Text>
            </View>
            {intelligence.missingEvidence.map((m, i) => (
              <View key={i} style={styles.evidenceItem}>
                <Text style={styles.evidenceDot}>?</Text>
                <Text style={styles.evidenceText}>{m}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>JARVIS Channel Intelligence · Confidential</Text>
          <Text style={styles.confidential}>CONFIDENTIAL</Text>
          <Text style={styles.footerRight} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
