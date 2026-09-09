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
    // Capture the element's full scroll size so content wider/taller than the
    // visible box (e.g. on small screens) isn't clipped.
    width: el.scrollWidth,
    height: el.scrollHeight,
    windowWidth: Math.max(document.documentElement.clientWidth, el.scrollWidth),
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.98);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  // Small margin so nothing prints outside the printer-safe area.
  const margin = 4;
  const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
  const imgH = (canvas.height * pageW) / canvas.width;

  let heightLeft = imgH;
  let position = margin;
  pdf.addImage(imgData, "JPEG", margin, position, pageW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", margin, position, pageW, imgH);
    heightLeft -= pageH;
  }

  pdf.save(filename);
}
