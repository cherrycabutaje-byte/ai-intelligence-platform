import PDFDocument from 'pdfkit';
import { ViralBrief } from '@/types/viral-brief';

function bufferFromStream(
  doc: PDFKit.PDFDocument
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) =>
      chunks.push(chunk)
    );
    doc.on('end', () =>
      resolve(Buffer.concat(chunks))
    );
    doc.on('error', reject);
  });
}

function drawDivider(doc: PDFKit.PDFDocument) {
  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor('#cccccc')
    .stroke();
  doc.moveDown(0.5);
}

function drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string
) {
  drawDivider(doc);
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('#333333')
    .text(title.toUpperCase());
  doc.moveDown(0.3);
  doc.font('Helvetica').fillColor('#000000');
}

function drawScoreBar(
  doc: PDFKit.PDFDocument,
  label: string,
  score: number,
  max: number
) {
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`${label}: ${score}/${max}`, {
      continued: false
    });
}

export async function renderViralBriefPDF(
  brief: ViralBrief
): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });

  const bufferPromise = bufferFromStream(doc);

  // Cover
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text('JARVIS Content Code Brief', {
      align: 'center'
    });

  doc.moveDown(0.3);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text(`Creator: ${brief.creatorId}`, {
      align: 'center'
    })
    .text(
      `Generated: ${new Date(
        brief.generatedAt
      ).toUTCString()}`,
      { align: 'center' }
    )
    .text(
      `Version: ${brief.auditVersion}`,
      { align: 'center' }
    );

  doc.moveDown(0.5);

  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(
      `${brief.overallScore} / 100`,
      { align: 'center' }
    );

  doc
    .fontSize(14)
    .font('Helvetica')
    .fillColor('#444444')
    .text(brief.scoreLabel, {
      align: 'center'
    });

  // Viral Score
  drawSectionTitle(
    doc,
    `Viral Score: ${brief.viralScore.total}/10 — ${brief.viralScore.label}`
  );

  doc.fontSize(10).font('Helvetica');
  drawScoreBar(
    doc,
    'Title Curiosity (Jenny)',
    brief.viralScore.titleCuriosity,
    2
  );
  drawScoreBar(
    doc,
    'Hook Curiosity (Jenny)',
    brief.viralScore.hookCuriosity,
    2
  );
  drawScoreBar(
    doc,
    'Stakes Present (MrBeast)',
    brief.viralScore.stakesPresent,
    2
  );
  drawScoreBar(
    doc,
    'Viewer Investment (MrBeast)',
    brief.viralScore.viewerInvestment,
    2
  );
  drawScoreBar(
    doc,
    'Time Bombs (Jenny)',
    brief.viralScore.timeBombs,
    1
  );
  drawScoreBar(
    doc,
    'Investment Moments (MrBeast)',
    brief.viralScore.investmentMoments,
    1
  );

  doc.moveDown(0.3);
  doc
    .font('Helvetica-Bold')
    .text(`Biggest gap: ${brief.viralScore.gap}`);

  // Verdict
  drawSectionTitle(doc, 'The Verdict');
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(brief.verdict);

  // Creator Voice
  drawSectionTitle(doc, 'Your Creator Voice');
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(brief.creatorVoice);

  // Audience Feeling
  drawSectionTitle(
    doc,
    'What Your Audience Feels'
  );
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(brief.audienceFeelingDiagnosis);

  // Most Interesting Moment
  drawSectionTitle(
    doc,
    'Your Most Interesting Moment'
  );
  if (
    typeof brief.mostInterestingMoment ===
      'object' &&
    brief.mostInterestingMoment !== null &&
    'quote' in brief.mostInterestingMoment
  ) {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(
        `"${brief.mostInterestingMoment.quote}"`
      );
    doc.moveDown(0.3);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        brief.mostInterestingMoment.whyItMatters
      );
  } else {
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(String(brief.mostInterestingMoment));
  }

  // Superpower
  drawSectionTitle(doc, 'Your Superpower');
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(brief.superpower);

  // Curiosity Code Diagnosis
  drawSectionTitle(
    doc,
    'The Curiosity Code — Jenny Hoyos Framework'
  );
  doc.fontSize(10).font('Helvetica-Bold').text('TITLE');
  doc.font('Helvetica').text(
    brief.curiosityDiagnosis.title
  );
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').text('HOOK');
  doc.font('Helvetica').text(
    brief.curiosityDiagnosis.hook
  );
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').text('RETENTION');
  doc.font('Helvetica').text(
    brief.curiosityDiagnosis.retention
  );
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').text('PAYOFF');
  doc.font('Helvetica').text(
    brief.curiosityDiagnosis.payoff
  );

  // Stakes Code Diagnosis
  drawSectionTitle(
    doc,
    'The Stakes Code — MrBeast Framework'
  );
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('WHAT IS AT STAKE');
  doc.font('Helvetica').text(
    brief.stakesDiagnosis.whatIsAtStake
  );
  doc.moveDown(0.4);
  doc
    .font('Helvetica-Bold')
    .text('DOES THE VIEWER CARE');
  doc.font('Helvetica').text(
    brief.stakesDiagnosis.doesViewerCare
  );
  doc.moveDown(0.4);
  doc
    .font('Helvetica-Bold')
    .text('HOW TO RAISE THE STAKES');
  doc.font('Helvetica').text(
    brief.stakesDiagnosis.howToRaiseStakes
  );
  doc.moveDown(0.4);
  doc
    .font('Helvetica-Bold')
    .text('INVESTMENT MOMENTS');
  doc.font('Helvetica').text(
    brief.stakesDiagnosis.investmentMoments
  );
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').text('OVER DELIVER');
  doc.font('Helvetica').text(
    brief.stakesDiagnosis.overDeliver
  );

  // Title Formula
  drawSectionTitle(
    doc,
    'Title Formula — The Content Code'
  );
  const titleLabels = [
    'Jenny Formula',
    'MrBeast Formula',
    'Combined Formula'
  ];
  brief.titleFormula.forEach((title, index) => {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`${titleLabels[index] ?? index + 1}:`);
    doc.font('Helvetica').text(title);
    doc.moveDown(0.3);
  });

  // Hook Script
  drawSectionTitle(
    doc,
    'Hook Script — Record This Now'
  );
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(brief.hookScript);

  // Open Loops
  drawSectionTitle(
    doc,
    'Time Bombs — Drop These In'
  );
  brief.openLoops.forEach((loop, index) => {
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`${index + 1}. ${loop}`);
    doc.moveDown(0.3);
  });

  // Shareable Line
  drawSectionTitle(
    doc,
    'The Line They Will Screenshot'
  );
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(`"${brief.shareableLine}"`);

  // Viral Bet
  drawSectionTitle(doc, 'The Viral Bet');
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(brief.viralBet);

  // Stop Doing
  drawSectionTitle(doc, 'Stop Doing This');
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(brief.stopDoing);

  // Win Condition
  drawSectionTitle(doc, 'How You Win');
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(brief.winCondition);

  // Coaching Sign Off
  drawDivider(doc);
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('#333333')
    .text('A NOTE FROM JARVIS');
  doc.moveDown(0.3);
  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#000000')
    .text(brief.coachingSignOff);

  doc.end();

  return bufferPromise;
}
