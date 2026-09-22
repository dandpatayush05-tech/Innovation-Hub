export interface ReceiptData {
  receiptNumber: string;
  bookingReference: string;
  bookingType: string;
  title: string;
  destination: string;
  travelDate: string;
  customerName: string;
  customerEmail: string;
  seats?: string[];
  totalAmount: number;
  paymentMethod: string;
  taxAmount?: number;
  hotelDetails?: {
    name: string;
    roomType: string;
    checkIn: string;
  };
}

export function generateAndDownloadReceipt(data: ReceiptData): void {
  const baseAmount = Math.round(data.totalAmount / 1.05);
  const gstAmount = data.totalAmount - baseAmount;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice & Travel Voucher - ${data.bookingReference}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #f8fafc; color: #0f172a; padding: 40px 20px; }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 48px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-name {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      background: #ecfdf5;
      color: #059669;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 999px;
      margin-top: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 28px;
      font-size: 13px;
    }
    .meta-item { display: flex; flex-direction: column; gap: 3px; }
    .meta-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; }
    .meta-val { font-weight: 700; color: #0f172a; }
    
    .table-container { margin-bottom: 28px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-weight: 700; }
    td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    
    .totals-box {
      margin-left: auto;
      width: 280px;
      font-size: 13px;
      margin-bottom: 32px;
    }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; color: #475569; }
    .total-row.grand {
      border-top: 2px solid #0f172a;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    
    .footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      display: block;
      margin: 20px auto 0;
      background: #0f172a;
      color: white;
      border: none;
      padding: 12px 28px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-name">Yatra Setu</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Smart India Travel & Holiday Hub</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">GSTIN: 07AAACY1234F1Z8 | SAC: 998553</div>
      </div>
      <div style="text-align: right;">
        <div class="badge">Official Paid Invoice</div>
        <div style="font-size: 14px; font-weight: 800; margin-top: 8px;">${data.bookingReference}</div>
        <div style="font-size: 11px; color: #64748b;">Invoice Date: ${issueDate}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Billed To</span>
        <span class="meta-val">${data.customerName}</span>
        <span style="color: #64748b;">${data.customerEmail}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Trip & Destination</span>
        <span class="meta-val">${data.title}</span>
        <span style="color: #64748b;">Destination: ${data.destination}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Travel Date / Departure</span>
        <span class="meta-val">${data.travelDate}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Payment Mode</span>
        <span class="meta-val">${data.paymentMethod}</span>
      </div>
    </div>

    ${data.hotelDetails ? `
    <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; font-size: 12px;">
      <strong style="color: #92400e;">🏨 Hotel Reservation:</strong> ${data.hotelDetails.name} (${data.hotelDetails.roomType}) | Check-in: ${data.hotelDetails.checkIn}
    </div>
    ` : ''}

    ${data.seats && data.seats.length > 0 ? `
    <div style="background: #eff6ff; border: 1px solid #dbeafe; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; font-size: 12px;">
      <strong style="color: #1e40af;">💺 Allocated Seats:</strong> ${data.seats.join(', ')} (Priority Boarding & Assist Enabled)
    </div>
    ` : ''}

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Type</th>
            <th style="text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${data.title}</strong>
              <div style="font-size: 11px; color: #64748b;">Comprehensive tour itinerary, verified hotel, transport & 24/7 care assistance</div>
            </td>
            <td>${data.bookingType.toUpperCase()}</td>
            <td style="text-align: right;">₹${baseAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals-box">
      <div class="total-row">
        <span>Base Fare:</span>
        <span>₹${baseAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>CGST (2.5%):</span>
        <span>₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row">
        <span>SGST / UTGST (2.5%):</span>
        <span>₹${Math.round(gstAmount / 2).toLocaleString('en-IN')}</span>
      </div>
      <div class="total-row grand">
        <span>Total Paid:</span>
        <span>₹${data.totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="footer">
      <div>
        <div><strong>Yatra Setu Customer Support:</strong> support@yatrasetu.com | 1800-111-363</div>
        <div style="margin-top: 2px;">This is a computer-generated tax invoice verified under Government of India GST rules.</div>
      </div>
      <div style="text-align: right; font-weight: 700; color: #059669;">
        ✓ PAID IN FULL
      </div>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
</body>
</html>
`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }
}
