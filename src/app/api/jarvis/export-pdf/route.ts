import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { JARVISReport } from '@/lib/pdf/jarvis-report';
import React from 'react';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const element = React.createElement(JARVISReport, {
      channelName: data.channelName,
      subscribers: data.subscribers,
      totalVideos: data.totalVideos,
      lastUploadDays: data.lastUploadDays,
      overallHealth: data.overallHealth,
      evidence: data.evidence,
      intelligence: data.intelligence,
      generatedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }) as any;

    const buffer = await renderToBuffer(element);
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="JARVIS-${data.channelName.replace(/\s+/g, '-')}-Intelligence-Report.pdf"`,
      },
    });

  } catch (error) {
    console.error('[PDF] Export error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}
