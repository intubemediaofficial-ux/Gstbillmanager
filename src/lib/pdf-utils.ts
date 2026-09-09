// Renders an HTMLElement into a compact A4 PDF.
// JPEG (quality 0.97, 3x render scale) on white background + deflate
// compression keeps visual output sharp while cutting file size ~10x vs PNG.
// Tall content is sliced across multiple A4 pages instead of one huge image.
export async function elementToPdf(el: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (await import("html2canvas-pro")).default;
  const { jsPDF } = await import("jspdf");

  // Wait for web fonts — html2canvas measures glyph/space widths from font
  // metrics; rendering before fonts load merges words together in the output.
  await document.fonts.ready;

  const canvas = await html2canvas(el, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.97);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
    heightLeft -= pageH;
  }

  pdf.save(filename);
}
