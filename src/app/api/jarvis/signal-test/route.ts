import { NextResponse } from 'next/server';
import { detectSignals }
  from '@/lib/coaching/content-signal-engine';

const TRANSCRIPTS = {
  christine: "welcome to my channel are you looking to bring some positive energy good luck and prosperity into your living space in this video we ll introduce you to 10 beautiful indoor plants that are believed to attract Good Fortune wealth and Tranquility whether you re a seasoned plant enthusiast or just starting out these plants are perfect for any home first on our list is the jade plant also known as CA OVA this succulent not only looks beautiful with its thick shiny leaves but is also believe to bring prosperity and financial luck place it near the entrance of your home to invite positive energy and wealth next up we have the lucky bamboo known for its slender elegant stocks and minimalist style this plant is a popular choice for attracting good fortune and health ensure it s placed in a spot with indirect sunlight and pure water to keep it thriving our third lucky plant is the peace lily with its white flowers and lush green leaves it s not only a visual Delight but also known for purifying the air and promoting Serenity and peace in your home meet the money tree according to Fang shuy this plant brings wealth and prosperity its unique braided trunk and vibrant leaves make it a captivating addition to your indoor garden just ensure it s kept in a well-lit spot and watered regularly there you have it our top 10 lucky indoor plants not only do these plants look amazing but they also bring positive energy and good fortune into your home have any of these plants brought you luck let us know in the comments below don t forget to like share and subscribe for more plant tips and inspiration thanks for watching and happy planting",

  selfHelp: "In this video I am going to say something that is going to make a lot of you feel uncomfortable. It is going to push some buttons. Three years ago I was afraid to leave home. I was stuck waiting for someone to give me a sign. I almost gave up everything I had worked for. But that moment when I realized nobody was coming to save me was the turning point. Today I live in Greece with nothing but a backpack and a laptop. I learned that the cost of waiting is your entire life. If you do not act now what happens next is on you. The moment you stop expecting someone to fix it is the moment you become dangerous. Stay with me because what I am about to tell you will change how you see everything. I will show you exactly what I did and why it worked.",

  plants: "welcome to my channel are you looking to bring some positive energy good luck and prosperity into your living space in this video we ll introduce you to 10 beautiful indoor plants that are believed to attract Good Fortune wealth and Tranquility"
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const which = searchParams.get('transcript') ?? 'christine';
  const transcript = TRANSCRIPTS[which as keyof typeof TRANSCRIPTS]
    ?? TRANSCRIPTS.christine;

  const result = detectSignals(transcript);

  return NextResponse.json({
    success: true,
    transcript: which,
    transformationStrength: result.transformationStrength,
    curiosityStrength: result.curiosityStrength,
    stakesStrength: result.stakesStrength,
    signals: result.signals,
    topEvidence: result.evidence.slice(0, 5)
  });
}
