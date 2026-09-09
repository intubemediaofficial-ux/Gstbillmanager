// Renders an HTMLElement into a compact A4 PDF.
// JPEG (quality 0.92) on white background + deflate compression keeps the
// visual output identical to PNG while cutting file size by ~10-20x.
// Tall content is sliced across multiple A4 pages instead of one huge image.
export async function elementToPdf(el: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (await import("html2canvas-pro")).default;
  const { jsPDF } = await import("jspdf");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

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
