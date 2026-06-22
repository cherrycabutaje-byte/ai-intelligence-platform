import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { VideoBriefPDF } from '@/lib/pdf/video-brief-report';

export async function POST(req: Request) {
  try {
    const { videoData, platform, result } = await req.json();
    const element = React.createElement(VideoBriefPDF, {
      videoData, platform, result,
      generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }) as any;
    const buffer = await renderToBuffer(element);
    const uint8Array = new Uint8Array(buffer);
    const filename = `JARVIS-Video-Brief-${(videoData?.title ?? 'Brief').slice(0, 30).replace(/\s+/g, '-')}.pdf`;
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Video PDF] Error:', error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
