import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const cyan = '#0891b2';
const dark = '#0f172a';
const gray = '#64748b';
const lightGray = '#f8fafc';
const borderColor = '#e2e8f0';
const red = '#dc2626';
const green = '#16a34a';
const yellow = '#d97706';
const purple = '#7c3aed';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  // Top bar
  topBar: {
    backgroundColor: dark,
    paddingHorizontal: 40,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#22d3ee',
    letterSpacing: 4,
  },
  logoTagline: {
    fontSize: 7,
    color: '#94a3b8',
    letterSpacing: 3,
    marginTop: 2,
  },
  reportMeta: {
    alignItems: 'flex-end',
  },
  reportType: {
    fontSize: 8,
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 8,
    color: '#64748b',
  },
  // Cyan accent bar
  accentBar: {
    backgroundColor: cyan,
    height: 3,
  },
  // Body
  body: {
    padding: 40,
  },
  // Channel header
  channelSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  channelLeft: {
    flex: 1,
  },
  channelName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: dark,
    marginBottom: 4,
  },
  channelMeta: {
    fontSize: 9,
    color: gray,
    marginBottom: 8,
  },
  healthBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  healthText: {
    fontSize: 7,
    color: red,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    backgroundColor: lightGray,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: borderColor,
  },
  statLabel: {
    fontSize: 6,
    color: gray,
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: dark,
    textAlign: 'center',
  },
  statValueRed: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: red,
    textAlign: 'center',
  },
  statValueYellow: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: yellow,
    textAlign: 'center',
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: cyan,
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: borderColor,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.7,
  },
  // Drift boxes
  driftRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  driftBox: {
    flex: 1,
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  driftBoxGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  driftBoxRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  driftLabel: {
    fontSize: 7,
    color: gray,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  driftValueGreen: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: green,
  },
  driftValueRed: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: red,
  },
  driftSub: {
    fontSize: 7,
    color: gray,
    marginTop: 2,
  },
  lossBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  lossBadgeText: {
    fontSize: 9,
    color: red,
    fontFamily: 'Helvetica-Bold',
  },
  // Mechanism
  mechanismCard: {
    backgroundColor: lightGray,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: purple,
    borderWidth: 1,
    borderColor: borderColor,
  },
  mechanismHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mechanismType: {
    fontSize: 7,
    color: purple,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  mechanismStrength: {
    fontSize: 7,
    color: purple,
    fontFamily: 'Helvetica-Bold',
  },
  mechanismText: {
    fontSize: 9,
    color: '#1e293b',
    lineHeight: 1.6,
  },
  // Hypothesis
  hypothesisCard: {
    backgroundColor: lightGray,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: borderColor,
  },
  hypothesisText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confidenceLabel: {
    fontSize: 7,
    color: gray,
  },
  confidenceBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  confidenceBarFill: {
    height: 3,
    backgroundColor: cyan,
    borderRadius: 2,
  },
  confidenceValue: {
    fontSize: 7,
    color: gray,
    width: 24,
    textAlign: 'right',
  },
  // Contradiction
  contradictionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  contradictionBox: {
    flex: 1,
    backgroundColor: lightGray,
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: borderColor,
  },
  contradictionLabel: {
    fontSize: 6,
    color: gray,
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  contradictionText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.5,
  },
  contradictionInsight: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: yellow,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  contradictionInsightText: {
    fontSize: 9,
    color: '#92400e',
    lineHeight: 1.5,
    fontFamily: 'Helvetica-Bold',
  },
  // Blind spot
  blindSpotCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: cyan,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  blindSpotText: {
    fontSize: 9,
    color: '#0c4a6e',
    lineHeight: 1.6,
    fontFamily: 'Helvetica-Bold',
  },
  // Strategic tension
  tensionCard: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: borderColor,
  },
  tensionText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.7,
    fontStyle: 'italic',
  },
  // Videos
  videosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  videoColumn: {
    flex: 1,
    backgroundColor: lightGray,
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: borderColor,
  },
  videoColumnTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: gray,
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  videoItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  videoRankTitle: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  videoRank: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: cyan,
  },
  videoRankRed: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: red,
  },
  videoTitle: {
    fontSize: 8,
    color: dark,
    flex: 1,
    lineHeight: 1.4,
  },
  videoViews: {
    fontSize: 8,
    color: green,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  videoViewsRed: {
    fontSize: 8,
    color: red,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  // Missing evidence
  missingItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
  },
  missingDot: {
    fontSize: 8,
    color: gray,
  },
  missingText: {
    fontSize: 8,
    color: gray,
    flex: 1,
    lineHeight: 1.5,
  },
  // Evidence facts
  evidenceItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 5,
  },
  evidenceDot: {
    fontSize: 8,
    color: cyan,
  },
  evidenceText: {
    fontSize: 8,
    color: '#374151',
    flex: 1,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: borderColor,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#cbd5e1',
  },
  footerConfidential: {
    fontSize: 7,
    color: '#cbd5e1',
    letterSpacing: 2,
  },
  pageNum: {
    fontSize: 7,
    color: '#cbd5e1',
  },
});

interface VideoData { title: string; views: number; }
interface CoreMechanism { name: string; mechanismType: string; creatorTranslation: string; mechanismStrength: number; }
interface Hypothesis { explanation: string; confidence: number; }
interface Contradiction { creatorBelief: string; audienceBehavior: string; insight: string; }
interface BlindSpot { insight: string; confidence: number; }
interface EvidenceData {
  averageViews: number; topPerformerAverage: number; recentPerformerAverage: number;
  gapRatio: number; driftScore: number; topVideos: VideoData[]; bottomVideos: VideoData[];
}
interface Intelligence {
  executiveSummary: string; evidence: string[]; hypotheses: Hypothesis[];
  coreMechanisms: CoreMechanism[]; contradictions: Contradiction[];
  blindSpots: BlindSpot[]; missingEvidence: string[]; strategicTension: string;
}
interface JARVISReportProps {
  channelName: string; subscribers: number; totalVideos: number;
  lastUploadDays: number; overallHealth: string; evidence: EvidenceData;
  intelligence: Intelligence; generatedAt: string;
}

export function JARVISReport({ channelName, subscribers, totalVideos, lastUploadDays, overallHealth, evidence, intelligence, generatedAt }: JARVISReportProps) {
  const lossPercent = evidence.topPerformerAverage > 0
    ? Math.round((1 - evidence.recentPerformerAverage / evidence.topPerformerAverage) * 100) : 0;

  const PageHeader = ({ subtitle }: { subtitle?: string }) => (
    <>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.logoText}>JARVIS</Text>
          <Text style={styles.logoTagline}>CHANNEL INTELLIGENCE</Text>
        </View>
        <View style={styles.reportMeta}>
          <Text style={styles.reportType}>INTELLIGENCE REPORT</Text>
          <Text style={styles.reportDate}>{subtitle ?? generatedAt}</Text>
        </View>
      </View>
      <View style={styles.accentBar} />
    </>
  );

  const PageFooter = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>JARVIS Channel Intelligence</Text>
      <Text style={styles.footerConfidential}>CONFIDENTIAL</Text>
      <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );

  return (
    <Document>

      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.body}>

          {/* Channel */}
          <View style={styles.channelSection}>
            <View style={styles.channelLeft}>
              <Text style={styles.channelName}>{channelName}</Text>
              <Text style={styles.channelMeta}>
                {subscribers.toLocaleString()} subscribers · {totalVideos} videos
                {lastUploadDays > 0 ? ` · ${lastUploadDays} days since last upload` : ''}
              </Text>
              <View style={styles.healthBadge}>
                <Text style={styles.healthText}>{overallHealth.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>AVG VIEWS</Text>
                <Text style={styles.statValue}>{evidence.averageViews.toLocaleString()}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>BEST AVG</Text>
                <Text style={styles.statValue}>{evidence.topPerformerAverage.toLocaleString()}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>RECENT AVG</Text>
                <Text style={styles.statValueRed}>{evidence.recentPerformerAverage.toLocaleString()}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>GAP</Text>
                <Text style={styles.statValueYellow}>{evidence.gapRatio}x</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>DRIFT</Text>
                <Text style={styles.statValueRed}>{evidence.driftScore}%</Text>
              </View>
            </View>
          </View>

          {/* Intelligence Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intelligence Summary</Text>
            <View style={styles.divider} />
            <Text style={styles.bodyText}>{intelligence.executiveSummary}</Text>
          </View>

          {/* Cost of Drift */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost of Drift</Text>
            <View style={styles.divider} />
            <View style={styles.driftRow}>
              <View style={[styles.driftBox, styles.driftBoxGreen]}>
                <Text style={styles.driftLabel}>BEST CONTENT AVERAGE</Text>
                <Text style={styles.driftValueGreen}>{evidence.topPerformerAverage.toLocaleString()}</Text>
                <Text style={styles.driftSub}>views per video</Text>
              </View>
              <View style={[styles.driftBox, styles.driftBoxRed]}>
                <Text style={styles.driftLabel}>RECENT CONTENT AVERAGE</Text>
                <Text style={styles.driftValueRed}>{evidence.recentPerformerAverage.toLocaleString()}</Text>
                <Text style={styles.driftSub}>views per video</Text>
              </View>
            </View>
            <View style={styles.lossBadge}>
              <Text style={styles.lossBadgeText}>-{lossPercent}% performance gap</Text>
            </View>
          </View>

          {/* Core Mechanisms */}
          {intelligence.coreMechanisms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What Your Content Is Actually Doing</Text>
              <View style={styles.divider} />
              {[...intelligence.coreMechanisms]
                .sort((a, b) => b.mechanismStrength - a.mechanismStrength)
                .map((m, i) => (
                  <View key={i} style={styles.mechanismCard}>
                    <View style={styles.mechanismHeader}>
                      <Text style={styles.mechanismType}>{m.mechanismType.toUpperCase()} · {m.name}</Text>
                      <Text style={styles.mechanismStrength}>Strength: {m.mechanismStrength}%</Text>
                    </View>
                    <Text style={styles.mechanismText}>{m.creatorTranslation}</Text>
                  </View>
                ))}
            </View>
          )}

        </View>
        <PageFooter />
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <PageHeader subtitle={channelName} />
        <View style={styles.body}>

          {/* Hypotheses */}
          {intelligence.hypotheses.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Possible Explanations</Text>
              <View style={styles.divider} />
              {intelligence.hypotheses.map((h, i) => (
                <View key={i} style={styles.hypothesisCard}>
                  <Text style={styles.hypothesisText}>{h.explanation}</Text>
                  <View style={styles.confidenceRow}>
                    <Text style={styles.confidenceLabel}>Confidence: {h.confidence}%</Text>
                    <View style={styles.confidenceBarBg}>
                      <View style={[styles.confidenceBarFill, { width: `${h.confidence}%` }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Contradictions */}
          {intelligence.contradictions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What the Data Contradicts</Text>
              <View style={styles.divider} />
              {intelligence.contradictions.map((c, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What JARVIS Cannot Ignore</Text>
              <View style={styles.divider} />
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
              <Text style={styles.sectionTitle}>The Strategic Tension</Text>
              <View style={styles.divider} />
              <View style={styles.tensionCard}>
                <Text style={styles.tensionText}>{intelligence.strategicTension}</Text>
              </View>
            </View>
          )}

          {/* Evidence */}
          {intelligence.evidence.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Evidence on Record</Text>
              <View style={styles.divider} />
              {intelligence.evidence.map((fact, i) => (
                <View key={i} style={styles.evidenceItem}>
                  <Text style={styles.evidenceDot}>•</Text>
                  <Text style={styles.evidenceText}>{fact}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Videos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Comparison</Text>
            <View style={styles.divider} />
            <View style={styles.videosRow}>
              <View style={styles.videoColumn}>
                <Text style={styles.videoColumnTitle}>WHAT WORKS</Text>
                {evidence.topVideos.slice(0, 3).map((v, i) => (
                  <View key={i} style={styles.videoItem}>
                    <View style={styles.videoRankTitle}>
                      <Text style={styles.videoRank}>#{i + 1}</Text>
                      <Text style={styles.videoTitle}>{v.title}</Text>
                    </View>
                    <Text style={styles.videoViews}>{v.views.toLocaleString()} views</Text>
                  </View>
                ))}
              </View>
              <View style={styles.videoColumn}>
                <Text style={styles.videoColumnTitle}>WHAT DOES NOT WORK</Text>
                {evidence.bottomVideos.slice(0, 3).map((v, i) => (
                  <View key={i} style={styles.videoItem}>
                    <View style={styles.videoRankTitle}>
                      <Text style={styles.videoRankRed}>#{i + 1}</Text>
                      <Text style={styles.videoTitle}>{v.title}</Text>
                    </View>
                    <Text style={styles.videoViewsRed}>{v.views.toLocaleString()} views</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Missing Evidence */}
          {intelligence.missingEvidence.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What JARVIS Cannot Determine</Text>
              <View style={styles.divider} />
              {intelligence.missingEvidence.map((m, i) => (
                <View key={i} style={styles.missingItem}>
                  <Text style={styles.missingDot}>?</Text>
                  <Text style={styles.missingText}>{m}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
        <PageFooter />
      </Page>

    </Document>
  );
}
