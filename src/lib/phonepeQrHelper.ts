/**
 * Official PhonePe Account & High-Reliability QR Code Generator
 * Configured specifically for: 9898074424@axl
 * Matching the exact PhonePe QR code from the user's Bank of Baroda account.
 */
import QRCode from 'qrcode';

export const OFFICIAL_PHONEPE_ACCOUNT = {
  accountName: "Bank Of Baroda - 5536",
  accountSubtitle: "Primary account for receiving money",
  bankName: "Bank Of Baroda",
  accountLast4: "5536",
  primaryUpiId: "9898074424@axl",
  brandColor: "#5f259f", // PhonePe Purple
  accentOrange: "#f35c24" // Bank of Baroda Orange
};

/**
 * Builds a 100% compliant, standard NPCI UPI URI for 9898074424@axl.
 */
export function buildPhonePeUpiUri(amount?: number, note?: string): string {
  const pa = OFFICIAL_PHONEPE_ACCOUNT.primaryUpiId;
  const pn = encodeURIComponent("Bank Of Baroda");
  
  if (amount && amount > 0) {
    const am = amount.toFixed(2);
    const tn = note ? `&tn=${encodeURIComponent(note)}` : '';
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR${tn}`;
  }
  return `upi://pay?pa=${pa}&pn=${pn}&cu=INR`;
}

/**
 * Generates a clean, high-contrast, perfectly scannable QR code.
 */
export async function generatePhonePeBrandedQr(
  upiUri: string,
  size: number = 440
): Promise<string> {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(upiUri, {
      width: size,
      margin: 1.5,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, (err, url) => {
      if (err || !url) {
        return reject(err || new Error("Failed to render QR Code"));
      }
      resolve(url);
    });
  });
}
