import { NextResponse } from 'next/server';
import { runChannelDiagnosis }
  from '@/lib/channel-intelligence/channel-diagnosis-engine';
import { saveGrowthOpportunities }
  from '@/lib/channel-intelligence/growth-opportunity-builder';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { channelId, creatorId } = await req.json();

    if (!channelId || !creatorId) {
      return NextResponse.json(
        { success: false, message: 'channelId and creatorId are required' },
        { status: 400 }
      );
    }

    // Get logged in user safely
    let userId = creatorId;
    try {
      const cookieStore = cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            }
          }
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch {
      // Use creatorId as fallback
    }

    // Run channel diagnosis
    const diagnosis = await runChannelDiagnosis(channelId, creatorId);

    // Save growth opportunities
    try {
      await saveGrowthOpportunities(diagnosis, userId);
    } catch (e) {
      console.error('[JARVIS] Growth save failed:', e);
    }

    return NextResponse.json({
      success: true,
      diagnosis,
      message: 'Growth opportunities saved to Growth page'
    });

  } catch (error) {
    console.error('[JARVIS] Diagnose error:', error);
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    );
  }
}
