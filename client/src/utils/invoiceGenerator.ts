import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { APP_NAME, CONTACT_INFO } from './constants';

export interface InvoiceItem {
    id: number | string;
    name: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
}

export interface InvoiceData {
    orderId: string;
    date: string;
    items: InvoiceItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        email?: string;
        phone?: string;
    };
    paymentMethod?: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // Helper to format currency safely
        const formatCurrency = (val: any) => {
            const num = parseFloat(val);
            return isNaN(num) ? '0.00' : num.toFixed(2);
        };

        // Header - Brand
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(APP_NAME || 'LUXE', 20, 30);

        // Tagline
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Premium Fashion & Tech', 20, 38);

        // Invoice Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });

        // Order Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Order #: ${data.orderId || 'N/A'}`, pageWidth - 20, 40, { align: 'right' });
        doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`, pageWidth - 20, 45, { align: 'right' });

        // Divider
        doc.setDrawColor(230, 230, 230);
        doc.line(20, 55, pageWidth - 20, 55);

        // Addresses
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('From:', 20, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(APP_NAME || 'LUXE', 20, 71);
        if (CONTACT_INFO?.address) {
            doc.text(CONTACT_INFO.address.street || '', 20, 76);
            doc.text(`${CONTACT_INFO.address.city || ''}, ${CONTACT_INFO.address.state || ''}`, 20, 81);
        }

        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 100, 65);
        doc.setFont('helvetica', 'normal');
        const addr = data.shippingAddress;
        if (addr) {
            doc.text(addr.name || 'Customer', 100, 71);
            doc.text(addr.address || '', 100, 76);
            doc.text(`${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`, 100, 81);
        }

        // Table
        const tableRows = (data.items || []).map(item => [
            `${item.name || 'Product'}${item.selectedColor || item.selectedSize ? ` (${[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')})` : ''}`,
            `$${formatCurrency(item.price)}`,
            (item.quantity || 1).toString(),
            `$${formatCurrency((item.price || 0) * (item.quantity || 1))}`
        ]);

        autoTable(doc, {
            startY: 95,
            head: [['Item Description', 'Price', 'Quantity', 'Total']],
            body: tableRows,
            theme: 'striped',
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: { fontSize: 9 },
            margin: { left: 20, right: 20 },
        });

        // Totals Section
        const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 130;
        const totalsX = pageWidth - 70;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', totalsX, finalY);
        doc.text(`$${formatCurrency(data.subtotal)}`, pageWidth - 20, finalY, { align: 'right' });

        doc.text('Shipping:', totalsX, finalY + 7);
        doc.text(`$${formatCurrency(data.shipping)}`, pageWidth - 20, finalY + 7, { align: 'right' });

        doc.text('Tax:', totalsX, finalY + 14);
        doc.text(`$${formatCurrency(data.tax)}`, pageWidth - 20, finalY + 14, { align: 'right' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', totalsX, finalY + 24);
        doc.text(`$${formatCurrency(data.total)}`, pageWidth - 20, finalY + 24, { align: 'right' });

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for shopping with LUXE!', pageWidth / 2, pageWidth === 210 ? 280 : 270, { align: 'center' });

        // Save
        doc.save(`Invoice_${data.orderId || 'order'}.pdf`);
    } catch (error) {
        console.error('Critical Error in PDF Generation:', error);
        throw error;
    }
};
