import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Invoice from '../models/Invoice.js';
import { ApiError } from '../utils/ApiError.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvoiceService {
  constructor() {
    this.gstRates = {
      standard: 18,
      reduced: 5,
      zero: 0
    };
    
    this.stateGstRates = {
      // All Indian states with their GST state codes
      'Karnataka': { code: '29', name: 'Karnataka' },
      'Maharashtra': { code: '27', name: 'Maharashtra' },
      'Tamil Nadu': { code: '33', name: 'Tamil Nadu' },
      'Delhi': { code: '07', name: 'Delhi' },
      'Gujarat': { code: '24', name: 'Gujarat' },
      // Add more states as needed
    };
  }

  // Generate invoice number
  async generateInvoiceNumber(financialYear = null, series = 'B4U') {
    const fy = financialYear || this.getCurrentFinancialYear();
    return await Invoice.generateInvoiceNumber(fy, series);
  }

  // Get current financial year
  getCurrentFinancialYear() {
    return Invoice.getCurrentFinancialYear();
  }

  // Calculate tax based on location
  calculateTax(amount, clientState, workerState, isInterstate = false) {
    const taxRate = this.gstRates.standard;
    const taxAmount = (amount * taxRate) / 100;
    
    const taxBreakdown = [];
    
    if (isInterstate || clientState !== workerState) {
      // Interstate transaction - IGST
      taxBreakdown.push({
        type: 'IGST',
        rate: taxRate,
        amount: taxAmount,
        description: 'Integrated Goods and Services Tax'
      });
    } else {
      // Intrastate transaction - CGST + SGST
      const halfRate = taxRate / 2;
      const halfAmount = taxAmount / 2;
      
      taxBreakdown.push({
        type: 'CGST',
        rate: halfRate,
        amount: halfAmount,
        description: 'Central Goods and Services Tax'
      });
      
      taxBreakdown.push({
        type: 'SGST',
        rate: halfRate,
        amount: halfAmount,
        description: 'State Goods and Services Tax'
      });
    }
    
    return {
      taxBreakdown,
      totalTax: taxAmount
    };
  }

  // Create invoice from payment request
  async createInvoice(paymentRequestId, options = {}) {
    try {
      const PaymentRequest = (await import('../models/Payment.js')).PaymentRequest;
      const ServiceRequest = (await import('../models/ServiceRequest.js')).default;
      const Client = (await import('../models/Client.js')).default;
      const Worker = (await import('../models/Worker.js')).default;

      const paymentRequest = await PaymentRequest.findById(paymentRequestId)
        .populate('client')
        .populate('worker')
        .populate('serviceRequest');

      if (!paymentRequest) {
        throw new ApiError(404, 'Payment request not found');
      }

      // Check if invoice already exists
      const existingInvoice = await Invoice.findOne({ paymentRequest: paymentRequestId });
      if (existingInvoice) {
        return existingInvoice;
      }

      const client = paymentRequest.client;
      const worker = paymentRequest.worker;
      const serviceRequest = paymentRequest.serviceRequest;

      // Generate invoice details
      const financialYear = this.getCurrentFinancialYear();
      const invoiceNumber = await this.generateInvoiceNumber(financialYear);
      
      // Prepare invoice items
      const items = [{
        description: paymentRequest.description || `${serviceRequest.category} services for ${serviceRequest.title}`,
        quantity: 1,
        unitPrice: paymentRequest.amount,
        totalPrice: paymentRequest.amount,
        category: 'labor',
        taxable: true
      }];

      // Calculate tax
      const clientState = client.location?.state || 'Karnataka';
      const workerState = worker.location?.state || 'Karnataka';
      const isInterstate = clientState !== workerState;
      
      const { taxBreakdown, totalTax } = this.calculateTax(
        paymentRequest.amount,
        clientState,
        workerState,
        isInterstate
      );

      // Prepare billing address
      const billingAddress = {
        name: client.name,
        address: client.location?.address || '',
        city: client.location?.city || '',
        state: clientState,
        pincode: client.location?.pincode || '',
        phone: client.phone || '',
        email: client.email,
        gstin: client.gstin || ''
      };

      // Calculate due date (30 days from invoice date)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice

      const invoice = new Invoice({
        invoiceNumber,
        financialYear,
        serviceRequest: serviceRequest._id,
        paymentRequest: paymentRequestId,
        client: client._id,
        worker: worker._id,
        invoiceDate: new Date(),
        dueDate,
        items,
        subtotal: paymentRequest.amount,
        taxBreakdown,
        totalTax,
        totalAmount: paymentRequest.amount + totalTax,
        billingAddress,
        placeOfSupply: clientState,
        notes: options.notes || '',
        createdBy: options.createdBy,
        createdByModel: options.createdByModel || 'Worker',
        transaction: options.transactionId || undefined,
        paidAmount: options.paidAmount || (paymentRequest.amount + totalTax)
      });

      // Calculate totals and update payment status
      invoice.calculateTotals();
      // Save invoice
      await invoice.save();

      // Generate PDF
      const pdfBuffer = await this.generatePDF(invoice);

      // In test/dev mode, skip Cloudinary and use dummy URL
      let pdfUrl;
      if (process.env.CASHFREE_ENVIRONMENT !== 'production' || process.env.NODE_ENV !== 'production') {
        pdfUrl = 'https://dummy.pdf.url/invoice.pdf';
      } else {
        pdfUrl = await this.uploadPDFToCloudinary(pdfBuffer, invoice.formattedInvoiceNumber);
      }

      // Update invoice with PDF URL
      invoice.pdfUrl = pdfUrl;
      invoice.documentStatus = 'sent';
      invoice.sentAt = new Date();
      await invoice.save();

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new ApiError(500, `Failed to create invoice: ${error.message}`);
    }
  }

  // Generate PDF invoice
  async generatePDF(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        this.addHeader(doc, invoice);
        
        // Invoice details
        this.addInvoiceDetails(doc, invoice);
        
        // Billing information
        this.addBillingInfo(doc, invoice);
        
        // Items table
        this.addItemsTable(doc, invoice);
        
        // Tax breakdown
        this.addTaxBreakdown(doc, invoice);
        
        // Total
        this.addTotal(doc, invoice);
        
        // Footer
        this.addFooter(doc, invoice);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  addHeader(doc, invoice) {
    // Company logo and details
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('BuildForYou Platform', 50, 50);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text('Professional Service Marketplace', 50, 75)
       .text(invoice.businessDetails.address, 50, 90)
       .text(`Phone: ${invoice.businessDetails.phone}`, 50, 105)
       .text(`Email: ${invoice.businessDetails.email}`, 50, 120)
       .text(`GSTIN: ${invoice.businessDetails.gstin}`, 50, 135);

    // Invoice title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('INVOICE', 400, 50);
    
    // Invoice number and date
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Invoice #: ${invoice.formattedInvoiceNumber}`, 400, 80)
       .text(`Date: ${invoice.invoiceDate.toLocaleDateString('en-IN')}`, 400, 95)
       .text(`Due Date: ${invoice.dueDate.toLocaleDateString('en-IN')}`, 400, 110);

    // Add line
    doc.moveTo(50, 160)
       .lineTo(550, 160)
       .stroke();
  }

  addInvoiceDetails(doc, invoice) {
    let y = 180;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Service Details:', 50, y);
    
    y += 20;
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Service: ${invoice.items[0]?.description || 'Professional Service'}`, 50, y)
       .text(`HSN Code: ${invoice.hsnCode}`, 50, y + 15)
       .text(`Place of Supply: ${invoice.placeOfSupply}`, 50, y + 30);
  }

  addBillingInfo(doc, invoice) {
    let y = 250;
    
    // Bill to
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 50, y);
    
    y += 20;
    doc.fontSize(10)
       .font('Helvetica')
       .text(invoice.billingAddress.name, 50, y)
       .text(invoice.billingAddress.address, 50, y + 15)
       .text(`${invoice.billingAddress.city}, ${invoice.billingAddress.state}`, 50, y + 30)
       .text(`PIN: ${invoice.billingAddress.pincode}`, 50, y + 45)
       .text(`Phone: ${invoice.billingAddress.phone}`, 50, y + 60)
       .text(`Email: ${invoice.billingAddress.email}`, 50, y + 75);
    
    if (invoice.billingAddress.gstin) {
      doc.text(`GSTIN: ${invoice.billingAddress.gstin}`, 50, y + 90);
    }
  }

  addItemsTable(doc, invoice) {
    let y = 380;
    
    // Table headers
    doc.fontSize(10)
       .font('Helvetica-Bold');
    
    doc.text('Description', 50, y)
       .text('Qty', 300, y)
       .text('Rate', 350, y)
       .text('Amount', 450, y);
    
    // Line under headers
    y += 15;
    doc.moveTo(50, y)
       .lineTo(550, y)
       .stroke();
    
    // Items
    y += 10;
    doc.font('Helvetica');
    
    invoice.items.forEach(item => {
      doc.text(item.description, 50, y, { width: 240 })
         .text(item.quantity.toString(), 300, y)
         .text(`₹${item.unitPrice.toFixed(2)}`, 350, y)
         .text(`₹${item.totalPrice.toFixed(2)}`, 450, y);
      y += 20;
    });
    
    // Subtotal line
    y += 10;
    doc.moveTo(50, y)
       .lineTo(550, y)
       .stroke();
    
    y += 15;
    doc.font('Helvetica-Bold')
       .text('Subtotal:', 350, y)
       .text(`₹${invoice.subtotal.toFixed(2)}`, 450, y);
  }

  addTaxBreakdown(doc, invoice) {
    let y = 480;
    
    if (invoice.taxBreakdown && invoice.taxBreakdown.length > 0) {
      doc.fontSize(10).font('Helvetica');
      
      invoice.taxBreakdown.forEach(tax => {
        y += 15;
        doc.text(`${tax.type} (${tax.rate}%):`, 350, y)
           .text(`₹${tax.amount.toFixed(2)}`, 450, y);
      });
      
      y += 20;
      doc.font('Helvetica-Bold')
         .text('Total Tax:', 350, y)
         .text(`₹${invoice.totalTax.toFixed(2)}`, 450, y);
    }
  }

  addTotal(doc, invoice) {
    let y = 560;
    
    // Total amount
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Total Amount:', 350, y)
       .text(`₹${invoice.totalAmount.toFixed(2)}`, 450, y);
    
    // Amount in words
    y += 25;
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Amount in words: ${this.numberToWords(invoice.totalAmount)} Rupees Only`, 50, y);
  }

  addFooter(doc, invoice) {
    let y = 650;
    
    // Terms and conditions
    if (invoice.termsAndConditions) {
      doc.fontSize(8)
         .font('Helvetica')
         .text('Terms & Conditions:', 50, y)
         .text(invoice.termsAndConditions, 50, y + 12, { width: 500 });
    }
    
    // Notes
    if (invoice.notes) {
      y += 40;
      doc.text('Notes:', 50, y)
         .text(invoice.notes, 50, y + 12, { width: 500 });
    }
    
    // Signature
    y += 60;
    doc.text('For BuildForYou Platform', 400, y)
       .text('Authorized Signatory', 400, y + 30);
  }

  // Convert number to words (simplified version)
  numberToWords(amount) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    function convertHundreds(num) {
      let result = '';
      
      if (num > 99) {
        result += ones[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
      }
      
      if (num > 19) {
        result += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
      } else if (num > 9) {
        result += teens[num - 10] + ' ';
        return result;
      }
      
      if (num > 0) {
        result += ones[num] + ' ';
      }
      
      return result;
    }
    
    const intAmount = Math.floor(amount);
    
    if (intAmount === 0) return 'Zero';
    
    let result = '';
    let crores = Math.floor(intAmount / 10000000);
    let lakhs = Math.floor((intAmount % 10000000) / 100000);
    let thousands = Math.floor((intAmount % 100000) / 1000);
    let hundreds = intAmount % 1000;
    
    if (crores > 0) {
      result += convertHundreds(crores) + 'Crore ';
    }
    
    if (lakhs > 0) {
      result += convertHundreds(lakhs) + 'Lakh ';
    }
    
    if (thousands > 0) {
      result += convertHundreds(thousands) + 'Thousand ';
    }
    
    if (hundreds > 0) {
      result += convertHundreds(hundreds);
    }
    
    return result.trim();
  }

  // Upload PDF to Cloudinary
  async uploadPDFToCloudinary(pdfBuffer, invoiceNumber) {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'invoices',
          public_id: `invoice_${invoiceNumber}_${Date.now()}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) throw error;
          return result.secure_url;
        }
      );

      return new Promise((resolve, reject) => {
        uploadStream.on('error', reject);
        uploadStream.on('end', (result) => {
          if (result && result.secure_url) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloud upload failed: No secure_url returned.'));
          }
        });
        
        const readableStream = new Readable();
        readableStream.push(pdfBuffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('Error uploading PDF to Cloudinary:', error);
      throw new ApiError(500, 'Failed to upload invoice PDF');
    }
  }

  // Get invoice by ID
  async getInvoice(invoiceId) {
    const invoice = await Invoice.findById(invoiceId)
      .populate('client', 'name email phone location')
      .populate('worker', 'name email phone location')
      .populate('serviceRequest', 'title category')
      .populate('paymentRequest');
    
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }
    
    return invoice;
  }

  // Get invoices with filters
  async getInvoices(filters = {}, pagination = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = pagination;

    const query = {};
    
    if (filters.client) query.client = filters.client;
    if (filters.worker) query.worker = filters.worker;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
    if (filters.financialYear) query.financialYear = filters.financialYear;
    
    if (filters.dateRange) {
      query.invoiceDate = {
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)
      };
    }

    const invoices = await Invoice.find(query)
      .populate('client', 'name email')
      .populate('worker', 'name email')
      .populate('serviceRequest', 'title category')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Invoice.countDocuments(query);

    return {
      invoices,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  // Mark invoice as paid
  async markAsPaid(invoiceId, paymentAmount, paymentDate = new Date()) {
    const invoice = await Invoice.findById(invoiceId);
    
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    await invoice.addPayment(paymentAmount);
    
    return invoice;
  }

  // Send invoice reminder
  async sendReminder(invoiceId) {
    const invoice = await this.getInvoice(invoiceId);
    
    // Implementation for sending email reminder
    // This would integrate with your email service
    
    return {
      success: true,
      message: 'Reminder sent successfully'
    };
  }
}

export default new InvoiceService();
