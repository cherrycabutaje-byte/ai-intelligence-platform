import PDFDocument from 'pdfkit';
import { GrowthAudit }
  from '@/types/growth-audit';

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

function drawDivider(
  doc: PDFKit.PDFDocument
) {
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
  doc
    .font('Helvetica')
    .fillColor('#000000');
}

export async function renderAuditPDF(
  audit: GrowthAudit
): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4'
  });

  const bufferPromise =
    bufferFromStream(doc);

  // Cover
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(
      'JARVIS Creator Growth Audit',
      { align: 'center' }
    );

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#666666')
    .text(
      `Creator: ${audit.creatorId}`,
      { align: 'center' }
    )
    .text(
      `Generated: ${new Date(audit.generatedAt).toUTCString()}`,
      { align: 'center' }
    )
    .text(
      `Audit Version: ${audit.auditVersion}`,
      { align: 'center' }
    );

  doc.moveDown(0.5);

  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(
      `${audit.overallScore} / 100`,
      { align: 'center' }
    );

  doc
    .fontSize(14)
    .font('Helvetica')
    .fillColor('#444444')
    .text(
      audit.scoreLabel,
      { align: 'center' }
    );

  // Score Reason
  drawSectionTitle(doc, 'Growth Score Breakdown');
  doc.fontSize(10).font('Helvetica').fillColor('#000000');
  audit.scoreReason
    .split('\n')
    .forEach(line => doc.text(line));

  // Top Opportunity
  drawSectionTitle(doc, 'Top Opportunity');
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(audit.topOpportunity.statement);
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Priority: ${audit.topOpportunity.priority}`);
  doc.text(`Why: ${audit.topOpportunity.reason}`);
  doc.text(`Action: ${audit.topOpportunity.action}`);
  doc.text(`Success Metric: ${audit.topOpportunity.successMetric}`);

  // Supporting Insights
  drawSectionTitle(doc, 'Supporting Insights');
  doc.fontSize(10).font('Helvetica').fillColor('#000000');
  audit.supportingInsights.forEach(
    insight => doc.text(`- ${insight}`)
  );

  // Execution Roadmap
  drawSectionTitle(doc, 'Execution Roadmap');
  audit.roadmap.forEach(step => {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(
        `Step ${step.step} — ${step.priority}: ${step.focus}`
      );
    doc.moveDown(0.2);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Action: ${step.action}`);
    doc.text(`Measure: ${step.successMetric}`);
    doc.moveDown(0.5);
  });

  // Recommended Experiment
  drawSectionTitle(doc, 'Recommended Experiment');
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#000000')
    .text(audit.experiment);

  // Expected Impact
  drawSectionTitle(doc, 'Expected Impact');
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#000000')
    .text(audit.expectedImpact);

  doc.end();

  return bufferPromise;
}
