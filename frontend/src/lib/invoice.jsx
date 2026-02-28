import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateInvoice(order) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 118, 110);
  doc.text('MediCore', 20, 22);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Online Medical Store | www.medicore.com', 20, 29);

  // Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 34, 190, 34);

  // Invoice title
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('INVOICE', 150, 22);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Order ID: ${order.id.slice(0, 8).toUpperCase()}`, 140, 40);
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 140, 46);
  doc.text(`Status: ${(order.status || '').replace('_', ' ').toUpperCase()}`, 140, 52);

  // Bill To
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text('BILL TO', 20, 44);
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(order.user_name || 'Customer', 20, 50);
  doc.text(order.user_email || '', 20, 56);
  const addressLines = (order.shipping_address || '').match(/.{1,50}/g) || [''];
  addressLines.forEach((line, i) => doc.text(line, 20, 62 + (i * 5)));

  // Items table
  const tableData = (order.items || []).map((item, idx) => [
    idx + 1,
    item.medicine_name,
    item.quantity,
    `$${item.price.toFixed(2)}`,
    `$${item.subtotal.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: 75,
    head: [['#', 'Medicine', 'Qty', 'Unit Price', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 80 }, 2: { cellWidth: 18, halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Totals
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', 140, finalY);
  doc.text(`$${order.total.toFixed(2)}`, 178, finalY, { align: 'right' });
  doc.text('Delivery:', 140, finalY + 6);
  doc.text('Free', 178, finalY + 6, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(140, finalY + 9, 190, finalY + 9);

  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text('Total:', 140, finalY + 16);
  doc.setTextColor(30, 30, 30);
  doc.text(`$${order.total.toFixed(2)}`, 178, finalY + 16, { align: 'right' });

  // Payment info
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Payment: ${(order.payment_method || '').replace('_', ' ').toUpperCase()}`, 20, finalY);
  doc.text(`Payment Status: ${(order.payment_status || '').toUpperCase()}`, 20, finalY + 6);

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 270, 190, 270);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping with MediCore!', 105, 277, { align: 'center' });
  doc.text('For support: support@medicore.com | +1 (800) 123-4567', 105, 282, { align: 'center' });
  doc.text('This is a computer-generated invoice. No signature required.', 105, 287, { align: 'center' });

  doc.save(`MediCore-Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
}
