const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigit(n: number): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
}

function threeDigit(n: number): string {
  if (n === 0) return "";
  if (n < 100) return twoDigit(n);
  return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + twoDigit(n % 100) : "");
}

export function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = "";
  if (intPart >= 10000000) {
    result += threeDigit(Math.floor(intPart / 10000000)) + " Crore ";
  }
  const afterCrore = intPart % 10000000;
  if (afterCrore >= 100000) {
    result += twoDigit(Math.floor(afterCrore / 100000)) + " Lakh ";
  }
  const afterLakh = afterCrore % 100000;
  if (afterLakh >= 1000) {
    result += twoDigit(Math.floor(afterLakh / 1000)) + " Thousand ";
  }
  const afterThousand = afterLakh % 1000;
  if (afterThousand > 0) {
    result += threeDigit(afterThousand);
  }

  result = result.trim() + " Rupees";
  if (decPart > 0) {
    result += " and " + twoDigit(decPart) + " Paise";
  }
  return result + " Only";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function validateGSTIN(gstin: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
}

export function getStateCodeFromGSTIN(gstin: string): string {
  return gstin.substring(0, 2);
}

export function isInterState(sellerStateCode: string, buyerStateCode: string): boolean {
  return sellerStateCode !== buyerStateCode;
}

export function calculateGST(subtotal: number, rate: number, isInterStateSupply: boolean) {
  const totalTax = (subtotal * rate) / 100;
  if (isInterStateSupply) {
    return { cgst: 0, sgst: 0, igst: totalTax, totalTax };
  }
  const half = totalTax / 2;
  return { cgst: half, sgst: half, igst: 0, totalTax };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
