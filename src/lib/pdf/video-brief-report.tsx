import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 0, fontFamily: 'Helvetica' },
  topBar: { backgroundColor: '#0f172a', paddingHorizontal: 40, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#22d3ee', letterSpacing: 4 },
  logoTagline: { fontSize: 7, color: '#94a3b8', letterSpacing: 3, marginTop: 2 },
  reportMeta: { alignItems: 'flex-end' },
  reportType: { fontSize: 8, color: '#94a3b8', letterSpacing: 2, marginBottom: 2 },
  reportDate: { fontSize: 8, color: '#64748b' },
  accentBar: { backgroundColor: '#0891b2', height: 3 },
  body: { padding: 40, paddingBottom: 60 },
  videoTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 4 },
  videoMeta: { fontSize: 9, color: '#64748b', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  sectionTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#0891b2', letterSpacing: 2, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginBottom: 10 },
  section: { marginBottom: 18 },
  itemCard: { backgroundColor: '#f8fafc', borderRadius: 6, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 3, borderLeftColor: '#0891b2' },
  itemRank: { fontSize: 7, color: '#0891b2', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  itemText: { fontSize: 9, color: '#1e293b', lineHeight: 1.6 },
  briefText: { fontSize: 9, color: '#374151', lineHeight: 1.7 },
  insightItem: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  insightDot: { fontSize: 9, color: '#0891b2' },
  insightText: { fontSize: 9, color: '#374151', flex: 1, lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#cbd5e1' },
  pageNum: { fontSize: 7, color: '#cbd5e1' },
});

interface Props {
  videoData: any;
  platform: string;
  result: any;
  generatedAt: string;
}

export function VideoBriefPDF({ videoData, platform, result, generatedAt }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.logoText}>JARVIS</Text>
            <Text style={styles.logoTagline}>VIDEO BRIEF</Text>
          </View>
          <View style={styles.reportMeta}>
            <Text style={styles.reportType}>CONTENT BRIEF · {platform?.toUpperCase()}</Text>
            <Text style={styles.reportDate}>{generatedAt}</Text>
          </View>
        </View>
        <View style={styles.accentBar} />
        <View style={styles.body}>
          <Text style={styles.videoTitle}>{videoData?.title ?? 'Video Brief'}</Text>
          <Text style={styles.videoMeta}>
            {videoData?.channelTitle ?? ''}
            {videoData?.views ? ` · ${Number(videoData.views).toLocaleString()} views` : ''}
            {videoData?.likes ? ` · ${Number(videoData.likes).toLocaleString()} likes` : ''}
          </Text>

          {result?.keyInsights?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WHAT JARVIS NOTICED</Text>
              <View style={styles.divider} />
              {result.keyInsights.map((insight: string, i: number) => (
                <View key={i} style={styles.insightItem}>
                  <Text style={styles.insightDot}>•</Text>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {result?.hooks?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>HOOK OPTIONS</Text>
              <View style={styles.divider} />
              {result.hooks.map((hook: string, i: number) => (
                <View key={i} style={styles.itemCard}>
                  <Text style={styles.itemRank}>HOOK #{i + 1}</Text>
                  <Text style={styles.itemText}>{hook}</Text>
                </View>
              ))}
            </View>
          )}

          {result?.titles?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TITLE OPTIONS</Text>
              <View style={styles.divider} />
              {result.titles.map((title: string, i: number) => (
                <View key={i} style={styles.itemCard}>
                  <Text style={styles.itemRank}>TITLE #{i + 1}</Text>
                  <Text style={styles.itemText}>{title}</Text>
                </View>
              ))}
            </View>
          )}

          {result?.brief && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CONTENT BRIEF</Text>
              <View style={styles.divider} />
              <Text style={styles.briefText}>{result.brief}</Text>
            </View>
          )}
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>JARVIS Video Brief · Confidential</Text>
          <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
