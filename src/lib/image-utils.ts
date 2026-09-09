// Client-side file → data-URL helpers.
// Images are downscaled to `maxDim` and re-encoded before being stored
// (Upstash Redis stores these blobs — uncompressed phone photos were making
// every list API return multi-MB payloads). Use "jpeg" for photos/full-color
// assets, "png" for graphics that need transparency (logos, signatures).
export function fileToDataUrl(
  file: File,
  opts: { maxDim?: number; quality?: number; format?: "jpeg" | "png" } = {}
): Promise<{ data: string; name: string; type: string }> {
  const { maxDim = 1600, quality = 0.85, format = "jpeg" } = opts;

  if (!file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ data: reader.result as string, name: file.name, type: file.type });
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);
      const type = format === "jpeg" ? "image/jpeg" : "image/png";
      resolve({ data: canvas.toDataURL(type, quality), name: file.name, type });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
