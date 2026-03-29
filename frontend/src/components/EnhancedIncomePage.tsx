import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { IncomeEntry } from '../types';
import { formatCurrency } from '../utils/currency';
import { Plus, Table, TrendingUp, FileText, Download, Send, Calendar, Package, Trash2, Edit2, CheckCircle, ChevronDown, Eye, X, Receipt } from 'lucide-react';
import Pagination from './Pagination';
import jsPDF from 'jspdf';

const incomeCategories = [
  "Sales", "Services", "Investments", "Loans", "Grants", "Other"
];

const paymentMethods = [
  "CASH", "TRANSFER"
] as const;

// Format number with thousand separator while typing
const formatNumberWithSeparator = (value: any): string => {
  // Convert to string if not already
  const stringValue = value !== null && value !== undefined ? String(value) : '';
  
  // Return empty string if input is empty
  if (stringValue === '') return '';
  
  // Remove existing separators and non-numeric characters
  const cleanValue = stringValue.replace(/[^0-9.]/g, '');
  
  // Split into integer and decimal parts
  const parts = cleanValue.split('.');
  let integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Add thousand separator to integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return formatted value
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

const EnhancedIncomePage = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'invoice' | 'records' | 'invoices' | 'vat'>('record');
  const location = useLocation();

  // Scroll to top when navigating to Income page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [formData, setFormData] = useState({
    description: '',
    quantity: '',
    unitPrice: '',
    category: '',
    paymentMethod: 'TRANSFER' as const,
    date: new Date().toISOString().split('T')[0],
    enableVAT: false,
    vatRate: 7.5
  });
  
  // VAT Records State - using reports page date filter pattern
  const [vatDateFilter, setVatDateFilter] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | 'allTime'>('today');
  const [vatSelectedMonth, setVatSelectedMonth] = useState(new Date().getMonth());
  const [vatSelectedYear, setVatSelectedYear] = useState(new Date().getFullYear());
  const [selectedVatRecord, setSelectedVatRecord] = useState<any>(null);
  const [showVatActionsModal, setShowVatActionsModal] = useState(false);
  const [showVatDetailsModal, setShowVatDetailsModal] = useState(false);
  const [vatLoading, setVatLoading] = useState(false);
  const [vatFilterChanging, setVatFilterChanging] = useState(false); // New state for filter transitions
  const [vatRecords, setVatRecords] = useState<any[]>([]);
  const [vatCurrentPage, setVatCurrentPage] = useState(1);
  const [vatTotalPages, setVatTotalPages] = useState(0);
  const [vatTotalRecords, setVatTotalRecords] = useState(0);
  const [vatEntriesPerPage, setVatEntriesPerPage] = useState(10);
  
  // VAT Summary State
  const [vatSummary, setVatSummary] = useState({
    totalVat: 0,
    averageVat: 0,
    highestVat: 0,
    totalTransactions: 0
  });
  
  // VAT Percentage Changes State
  const [vatPercentageChanges, setVatPercentageChanges] = useState({
    totalVatChange: 0,
    averageVatChange: 0,
    highestVatChange: 0
  });
  
  // Invoice state
  const [invoiceData, setInvoiceData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    items: [
      {
        description: '',
        quantity: '',
        unitPrice: '',
        total: 0
      }
    ],
    notes: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    paymentMethod: 'TRANSFER'
  });
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  
  // Invoice records state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(0);
  const invoiceEntriesPerPage = 10;
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [incomesLoading, setIncomesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const entriesPerPage = 10;
  
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdown]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [success]);
  
  // Refetch VAT data when date filter changes
  useEffect(() => {
    if (activeTab === 'vat') {
      fetchVatRecords(true);
    }
  }, [vatDateFilter, vatSelectedMonth, vatSelectedYear]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'records') {
      fetchIncomes(1);
    } else if (activeTab === 'invoices') {
      fetchInvoices(1);
    } else if (activeTab === 'vat') {
      fetchVatRecords();
    }
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Helper function to get quantity from invoice records (for invoice-based income entries)
  const getQuantityFromInvoiceRecords = (income: any): string => {
    // Check if this income entry came from an invoice (description contains invoice info)
    // Try multiple patterns to handle different description formats (including hyphens)
    const invoiceMatch = income.description?.match(/Payment for invoice #([^\s]+)/) || 
                         income.description?.match(/Invoice #([^\s]+)/) ||
                         income.description?.match(/invoice #([^\s]+)/i) ||
                         income.description?.match(/Payment for invoice #([A-Z0-9]+)/);
    
    if (!invoiceMatch) return '';
    
    const invoiceNumber = invoiceMatch[1];
    
    // Find the corresponding invoice
    const storedInvoices = localStorage.getItem('farm_invoices');
    const allInvoices = storedInvoices ? JSON.parse(storedInvoices) : [];
    
    const matchingInvoice = allInvoices.find((invoice: any) => 
      invoice.invoiceNumber === invoiceNumber
    );
    
    if (matchingInvoice && matchingInvoice.items) {
      // Calculate total quantity from invoice items
      const totalQuantity = matchingInvoice.items.reduce((total: number, item: any) => 
        total + (item.quantity || 0), 0
      );
      return totalQuantity.toString();
    }
    
    return '';
  };

  // Get display quantity with two sources only: Record Income tab and Invoice Records tab
  const getDisplayQuantity = (income: any): string => {
    // Helper function to check if quantity has a valid value
    const hasValidQuantity = (qty: any): boolean => {
      if (qty === null || qty === undefined || qty === '') return false;
      const numQty = parseFloat(qty);
      return !isNaN(numQty) && numQty > 0;
    };

    // 1. Try quantity field first (handle both string and number) - from Record Income tab
    if (hasValidQuantity(income.quantity)) {
      return income.quantity.toString();
    }
    
    // 2. Try to get from invoice records (if this is from an invoice) - from Invoice Records tab
    const invoiceQuantity = getQuantityFromInvoiceRecords(income);
    if (hasValidQuantity(invoiceQuantity)) {
      return invoiceQuantity.toString();
    }
    
    // No regex fallback - return empty if neither source has valid quantity
    return '';
  };
  const fetchIncomes = async (page: number = 1) => {
    if (!user) return;
    
    setIncomesLoading(true);
    
    try {
      // DATABASE-ONLY APPROACH: Get income entries directly from database
      const offset = (page - 1) * entriesPerPage;
      
      // Fetch income entries from database (includes both manual and invoice-based income)
      const incomeResponse = await api.get<{ entries: IncomeEntry[], total: number }>('/finance/income', {
        params: {
          limit: entriesPerPage,
          offset: offset,
          _t: Date.now() // Cache-busting parameter
        }
      });
      
      // Process income entries to ensure proper creator/approver info (VAT comes from database)
      const processedIncomeEntries = incomeResponse.data.entries.map((entry: any) => {
        // Check if this income came from an invoice and extract creator from metadata
        if (entry.description?.includes('Payment for invoice #')) {
          // Extract invoice creator from metadata first, then from description as fallback
          const invoiceCreator = entry.metadata?.invoiceCreator || 
            (() => {
              const creatorMatch = entry.description.match(/\[Invoice Creator: ([^\]]+)\]/);
              return creatorMatch ? creatorMatch[1] : entry.user?.name || 'Unknown';
            })();
          
          return {
            ...entry,
            invoiceCreator,
            approvedBy: entry.approvedBy || entry.user?.name
          };
        } else {
          // For manual income entries
          return {
            ...entry,
            invoiceCreator: undefined,
            approvedBy: entry.approvedBy || entry.user?.name
          };
        }
      });
      
      const apiIncomes = processedIncomeEntries;
      const totalApiIncomes = incomeResponse.data.total;
      
      console.log('📈 Income records loaded from database:', {
        databaseCount: apiIncomes.length,
        totalCount: totalApiIncomes,
        // Debug: Show first few entries to verify creator and approver
        sampleEntries: apiIncomes.slice(0, 3).map(entry => ({
          description: entry.description,
          invoiceCreator: entry.invoiceCreator,
          approvedBy: entry.approvedBy,
          user: entry.user?.name
        }))
      });
      
      setIncomes(apiIncomes);
      setTotalIncomes(totalApiIncomes);
      setTotalPages(Math.ceil(totalApiIncomes / entriesPerPage));
      setCurrentPage(page);
      
      console.log('📈 Income records loaded from database:', {
        databaseCount: apiIncomes.length,
        totalCount: totalApiIncomes
      });
      
    } catch (error: any) {
      console.error('Failed to fetch incomes:', error);
      setError('Failed to load income records');
    } finally {
      setIncomesLoading(false);
    }
  };

  // Fetch incomes when switching to records tab
  const handleTabChange = (tab: 'record' | 'invoice' | 'records' | 'invoices' | 'vat') => {
    setActiveTab(tab);
    if (tab === 'records') {
      fetchIncomes(1); // Reset to first page when switching tabs
    } else if (tab === 'invoices') {
      fetchInvoices(1); // Reset to first page when switching to invoices tab
    } else if (tab === 'vat') {
      fetchVatRecords(); // Fetch VAT records when switching to VAT tab
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    fetchIncomes(page);
  };

  // Invoice functions
  const resetInvoiceForm = () => {
    setInvoiceData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      items: [
        {
          description: '',
          quantity: '',
          unitPrice: '',
          total: 0
        }
      ],
      notes: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      paymentMethod: 'TRANSFER'
    });
    setGeneratedInvoice(null);
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].total = qty * price;
    }
    
    setInvoiceData(prev => {
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.075; // 7.5% tax
      const total = subtotal + tax;
      
      return {
        ...prev,
        items: newItems,
        subtotal,
        tax,
        total
      };
    });
  };

  const addInvoiceItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: '',
        unitPrice: '',
        total: 0
      }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleInvoiceChange = (field: string, value: any) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerateInvoice();
  };

  const handleGenerateInvoice = async () => {
    try {
      setIsGeneratingInvoice(true);
      setError('');

      // Validate required fields
      if (!invoiceData.clientName || !invoiceData.items || invoiceData.items.length === 0) {
        setError('Client name and at least one item are required');
        return;
      }

      const invoice = {
        invoiceNumber: invoiceData.invoiceNumber,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientPhone: invoiceData.clientPhone,
        clientAddress: invoiceData.clientAddress,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        paymentMethod: invoiceData.paymentMethod,
        dueDate: invoiceData.dueDate,
        notes: invoiceData.notes,
        businessName: 'Farm Operations',
        businessEmail: 'farm@example.com',
        businessPhone: '+234-XXX-XXX-XXXX',
        businessAddress: 'Farm Location, Nigeria',
        userId: user?.id,
        createdBy: user?.id
      };

      console.log('🔄 Creating invoice in database:', {
        invoice,
        user
      });

      // Save invoice to database via API
      const response = await api.post('/invoices', invoice);
      
      console.log('✅ Invoice saved to database:', response.data);
      
      setGeneratedInvoice(response.data);
      
      // Refresh invoice list to show the new invoice
      fetchInvoices(1);
      
      setSuccess(`Invoice #${response.data.invoiceNumber} created successfully!`);
      
    } catch (error: any) {
      console.error('❌ Failed to create invoice:', error);
      setError(error.response?.data?.error || 'Failed to create invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const downloadInvoice = (invoice?: any) => {
    const invoiceToDownload = invoice || generatedInvoice;
    if (!invoiceToDownload) {
      console.error('No invoice data available for download');
      return;
    }

    try {
      const doc = new jsPDF();
      let yPosition = 20;
    
      // Set up fonts
      const headerFontSize = 16;
      const normalFontSize = 12;
      doc.setFont('helvetica');
      
      // Header
      doc.setFontSize(headerFontSize + 4);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE', 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Business Information
      doc.setFontSize(headerFontSize);
      doc.setTextColor(0, 0, 0);
      doc.text('From:', 20, yPosition);
      yPosition += 7;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    doc.text(generatedInvoice.businessName || 'Farm Operations', 20, yPosition);
    yPosition += 5;
    doc.text(generatedInvoice.businessAddress || 'Farm Location, Nigeria', 20, yPosition);
    yPosition += 5;
    doc.text(generatedInvoice.businessEmail || '', 20, yPosition);
    yPosition += 5;
    doc.text(generatedInvoice.businessPhone || '+234-XXX-XXX-XXXX', 20, yPosition);
    yPosition += 15;
    
    // Client Information
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 20, yPosition);
    yPosition += 7;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    doc.text(generatedInvoice.clientName || 'Client Name', 20, yPosition);
    yPosition += 5;
    doc.text(generatedInvoice.clientAddress || '', 20, yPosition);
    yPosition += 5;
    doc.text(generatedInvoice.clientEmail || '', 20, yPosition);
    yPosition += 5;
    doc.text(generatedInvoice.clientPhone || '', 20, yPosition);
    yPosition += 15;
    
    // Invoice Details
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice Details:', 20, yPosition);
    yPosition += 7;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    const invoiceDate = generatedInvoice.invoiceDate ? new Date(generatedInvoice.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString();
    const dueDate = generatedInvoice.dueDate ? new Date(generatedInvoice.dueDate).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Invoice Date: ${invoiceDate}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Due Date: ${dueDate}`, 20, yPosition);
    yPosition += 15;
    
    // Items Table Header
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Items:', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(normalFontSize);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.text('Description', 25, yPosition);
    doc.text('Quantity', 100, yPosition);
    doc.text('Unit Price', 130, yPosition);
    doc.text('Total', 160, yPosition);
    yPosition += 10;
    
    // Table items
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    
    generatedInvoice.items.forEach((item: any) => {
      // Split long descriptions if needed
      const description = item.description || '';
      const maxLineLength = 40;
      if (description.length > maxLineLength) {
        const words = description.split(' ');
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + word).length <= maxLineLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) {
              doc.text(currentLine, 25, yPosition);
              currentLine = word;
              yPosition += 5;
            }
          }
        });
        if (currentLine) {
          doc.text(currentLine, 25, yPosition);
        }
      } else {
        if (description) {
          doc.text(description, 25, yPosition);
        }
      }
      
      // Add defensive checks for numeric values
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const total = item.total || 0;
      
      doc.text(quantity.toString(), 100, yPosition);
      doc.text(`₦${unitPrice.toLocaleString()}`, 130, yPosition);
      doc.text(`₦${total.toLocaleString()}`, 160, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Summary Section
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary:', 120, yPosition);
    yPosition += 10;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    const subtotal = generatedInvoice.subtotal || 0;
    const tax = generatedInvoice.tax || 0;
    const total = generatedInvoice.total || 0;
    
    doc.text(`Subtotal: ${formatCurrency(subtotal, { includeSymbol: false })}`, 120, yPosition);
    yPosition += 6;
    doc.text(`Tax (7.5%): ${formatCurrency(tax, { includeSymbol: false })}`, 120, yPosition);
    yPosition += 6;
    
    doc.setFontSize(normalFontSize + 2);
    doc.setFont('normal', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total: ${formatCurrency(total, { includeSymbol: false })}`, 120, yPosition);
    yPosition += 15;
    
    // Notes section
    if (generatedInvoice.notes) {
      doc.setFontSize(headerFontSize);
      doc.setFont('normal', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Notes:', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(normalFontSize);
      doc.setTextColor(60, 60, 60);
      
      const notes = generatedInvoice.notes;
      const maxNotesLength = 60;
      if (notes.length > maxNotesLength) {
        const words = notes.split(' ');
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + word).length <= maxNotesLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            doc.text(currentLine, 20, yPosition);
            currentLine = word;
            yPosition += 5;
          }
        });
        if (currentLine) {
          doc.text(currentLine, 20, yPosition);
        }
      } else {
        doc.text(notes, 20, yPosition);
      }
    }
    
    // Save the PDF
    doc.save(`invoice-${generatedInvoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate invoice PDF');
    }
  };

  const sendInvoice = (invoice?: any) => {
    const invoiceToSend = invoice || generatedInvoice;
    if (!invoiceToSend) return;
    
    try {
      // Create mailto link with invoice details
      const subject = `Invoice ${invoiceToSend.invoiceNumber || 'N/A'} from TrackFarmOps`;
      const body = `Dear ${invoiceToSend.clientName || 'Valued Customer'},

Thank you for your business. Please find your invoice details below:

Invoice Number: ${invoiceToSend.invoiceNumber || 'N/A'}
Amount: ${formatCurrency(invoiceToSend.total || 0)}
Due Date: ${invoiceToSend.dueDate ? new Date(invoiceToSend.dueDate).toLocaleDateString() : 'N/A'}
Items: ${invoiceToSend.items?.map((item: any) => 
  `- ${item.description || 'Item'}: ${item.quantity || 0} × ${formatCurrency(item.unitPrice || item.price || 0, { includeSymbol: false })} = ${formatCurrency(item.total || 0, { includeSymbol: false })}`
).join('\n') || 'No items listed'}

${invoiceToSend.notes ? `Notes: ${invoiceToSend.notes}` : ''}

Please let us know if you have any questions.

Best regards,
TrackFarmOps Team`;

      // Create mailto link
      const clientEmail = invoiceToSend.clientEmail || '';
      const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client
      window.open(mailtoLink, '_blank');
      
      console.log('Opening email client for invoice:', invoiceToSend);
      setSuccess('Email client opened with invoice details!');
    } catch (error) {
      console.error('Failed to open email client:', error);
      setError('Failed to open email client');
    }
  };

  // Download stored invoice (for Invoice Records tab)
  const downloadStoredInvoice = (invoice: any) => {
    if (!invoice) return;
    
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Set up fonts
    const headerFontSize = 16;
    const normalFontSize = 12;
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(headerFontSize + 4);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 105, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Invoice Number
    doc.setFontSize(headerFontSize);
    doc.setTextColor(60, 60, 60);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Business Information
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('From:', 20, yPosition);
    yPosition += 7;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    doc.text(invoice.businessName || 'Farm Operations', 20, yPosition);
    yPosition += 5;
    doc.text(invoice.businessAddress || 'Farm Location, Nigeria', 20, yPosition);
    yPosition += 5;
    doc.text(invoice.businessEmail || '', 20, yPosition);
    yPosition += 5;
    doc.text(invoice.businessPhone || '+234-XXX-XXX-XXXX', 20, yPosition);
    yPosition += 15;
    
    // Client Information
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Bill To:', 20, yPosition);
    yPosition += 7;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    doc.text(invoice.clientName || 'Client Name', 20, yPosition);
    yPosition += 5;
    doc.text(invoice.clientAddress || '', 20, yPosition);
    yPosition += 5;
    doc.text(invoice.clientEmail || '', 20, yPosition);
    yPosition += 5;
    doc.text(invoice.clientPhone || '', 20, yPosition);
    yPosition += 15;
    
    // Invoice Details
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Invoice Details:', 20, yPosition);
    yPosition += 7;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    const invoiceDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString();
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`Invoice Date: ${invoiceDate}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Due Date: ${dueDate}`, 20, yPosition);
    yPosition += 15;
    
    // Items Table Header
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Items:', 20, yPosition);
    yPosition += 10;
    
    // Table headers
    doc.setFontSize(normalFontSize);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.text('Description', 25, yPosition);
    doc.text('Quantity', 100, yPosition);
    doc.text('Unit Price', 130, yPosition);
    doc.text('Total', 160, yPosition);
    yPosition += 10;
    
    // Table items
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    
    invoice.items.forEach((item: any) => {
      // Split long descriptions if needed
      const description = item.description || '';
      const maxLineLength = 40;
      if (description.length > maxLineLength) {
        const words = description.split(' ');
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + word).length <= maxLineLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) {
              doc.text(currentLine, 25, yPosition);
              currentLine = word;
              yPosition += 5;
            }
          }
        });
        if (currentLine) {
          doc.text(currentLine, 25, yPosition);
        }
      } else {
        if (description) {
          doc.text(description, 25, yPosition);
        }
      }
      
      // Add defensive checks for numeric values
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const total = item.total || 0;
      
      doc.text(quantity.toString(), 100, yPosition);
      doc.text(`₦${unitPrice.toLocaleString()}`, 130, yPosition);
      doc.text(`₦${total.toLocaleString()}`, 160, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Summary Section
    doc.setFontSize(headerFontSize);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary:', 120, yPosition);
    yPosition += 10;
    
    doc.setFontSize(normalFontSize);
    doc.setTextColor(60, 60, 60);
    const subtotal = invoice.subtotal || 0;
    const tax = invoice.tax || 0;
    const total = invoice.total || 0;
    
    doc.text(`Subtotal: ${formatCurrency(subtotal, { includeSymbol: false })}`, 120, yPosition);
    yPosition += 6;
    doc.text(`Tax (7.5%): ${formatCurrency(tax, { includeSymbol: false })}`, 120, yPosition);
    yPosition += 6;
    
    doc.setFontSize(normalFontSize + 2);
    doc.setFont('normal', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total: ${formatCurrency(total, { includeSymbol: false })}`, 120, yPosition);
    yPosition += 15;
    
    // Notes section
    if (invoice.notes) {
      doc.setFontSize(headerFontSize);
      doc.setFont('normal', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Notes:', 20, yPosition);
      yPosition += 7;
      
      doc.setFontSize(normalFontSize);
      doc.setTextColor(60, 60, 60);
      
      const notes = invoice.notes;
      const maxNotesLength = 60;
      if (notes.length > maxNotesLength) {
        const words = notes.split(' ');
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + word).length <= maxNotesLength) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            doc.text(currentLine, 20, yPosition);
            currentLine = word;
            yPosition += 5;
          }
        });
        if (currentLine) {
          doc.text(currentLine, 20, yPosition);
        }
      } else {
        doc.text(notes, 20, yPosition);
      }
    }
    
    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  // Invoice records functions
  const fetchInvoices = async (page: number = 1) => {
    if (!user) return;
    
    setInvoicesLoading(true);
    try {
      const offset = (page - 1) * invoiceEntriesPerPage;
      console.log(`📄 Fetching invoices for user ${user.name} (ID: ${user.id}): page=${page}, limit=${invoiceEntriesPerPage}, offset=${offset}`);
      
      // DATABASE-ONLY APPROACH: Get invoices directly from database with user filtering
      const response = await api.get('/invoices', {
        params: {
          limit: invoiceEntriesPerPage,
          offset: offset
        }
      });
      
      // Get database data only (already filtered by user in backend)
      const apiInvoices = response.data.entries || [];
      const totalApiInvoices = response.data.total || 0;
      
      console.log('📊 Database-only invoice approach:');
      console.log(`- Database records: ${apiInvoices.length}`);
      console.log(`- Total records: ${totalApiInvoices}`);
      
      setInvoices(apiInvoices);
      setTotalInvoices(totalApiInvoices);
      setInvoiceTotalPages(Math.ceil(totalApiInvoices / invoiceEntriesPerPage));
      setInvoiceCurrentPage(page);
      
      console.log('📈 Invoice records loaded from database:', {
        databaseCount: apiInvoices.length,
        totalCount: totalApiInvoices,
        paginatedCount: apiInvoices.length,
        totalPages: Math.ceil(totalApiInvoices / invoiceEntriesPerPage),
        currentPage: page,
        userId: user.id,
        userName: user.name
      });
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load invoice records');
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleInvoicePageChange = (page: number) => {
    fetchInvoices(page);
  };

  const deleteInvoice = async (invoiceId: number) => {
    try {
      console.log(`🗑️ Deleting invoice ${invoiceId} for user ${user?.name}`);
      
      // Delete invoice from database (backend will verify ownership)
      await api.delete(`/invoices/${invoiceId}`);
      
      console.log('✅ Invoice deleted successfully');
      
      fetchInvoices(invoiceCurrentPage); // Refresh the list
      setSuccess('Invoice deleted successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to delete invoice:', error);
      setError(error.response?.data?.error || 'Failed to delete invoice');
    }
  };

  // Edit invoice functions
  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowEditModal(true);
  };

  // View invoice function
  const handleViewInvoice = (invoice: any) => {
    setViewingInvoice(invoice);
    setShowViewModal(true);
    setActiveDropdown(null);
  };

  // Actions modal function
  const handleActionsModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowActionsModal(true);
  };

  const closeActionsModal = () => {
    setShowActionsModal(false);
    setSelectedInvoice(null);
  };

  const handleUpdateInvoice = async (updatedInvoice: any) => {
    try {
      console.log(`📝 Updating invoice ${updatedInvoice.id} for user ${user?.name}`);
      
      // Update invoice in database (backend will verify ownership)
      const response = await api.put(`/invoices/${updatedInvoice.id}`, updatedInvoice);
      
      console.log('✅ Invoice updated successfully:', response.data);
      
      setShowEditModal(false);
      setEditingInvoice(null);
      fetchInvoices(invoiceCurrentPage); // Refresh the list
      setSuccess('Invoice updated successfully!');
      
    } catch (error: any) {
      console.error('❌ Failed to update invoice:', error);
      setError(error.response?.data?.error || 'Failed to update invoice');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingInvoice(null);
  };

  // Delete confirmation functions
  const handleDeleteClick = (invoice: any) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
      setSuccess(`Invoice #${invoiceToDelete.invoiceNumber} deleted successfully!`);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  // Mark as paid function with debouncing to prevent double-clicks
  const handleMarkAsPaid = async (invoice: any) => {
    try {
      console.log('💳 Marking invoice as paid:', invoice);

      // Update invoice status to paid in database (backend will create income entry)
      const invoiceResponse = await api.patch(`/invoices/${invoice.id}/mark-paid`);
      
      console.log('✅ Invoice marked as paid in database:', invoiceResponse.data);

      // Refresh both income records and invoice list
      fetchIncomes(1);
      fetchInvoices(1);

      setSuccess(`Invoice #${invoice.invoiceNumber} marked as paid and income entry created!`);
      
    } catch (error: any) {
      console.error('❌ Failed to mark invoice as paid:', error);
      setError(error.response?.data?.error || 'Failed to mark invoice as paid');
    }
  };
  
  // Simple debounce implementation
  const debounce = (func: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };
  
  // Debounced version to prevent double-clicks
  const debouncedMarkAsPaid = useRef(
    debounce((invoice: any) => {
      handleMarkAsPaid(invoice);
    }, 1000) // 1 second debounce
  ).current;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const quantity = parseFloat(formData.quantity);
      const unitPrice = parseFloat(formData.unitPrice);
      const subtotal = quantity * unitPrice;
      
      // Calculate VAT if enabled
      const vatAmount = formData.enableVAT ? (subtotal * formData.vatRate) / 100 : 0;
      const totalAmount = subtotal + vatAmount;
      
      const incomeData = {
        amount: subtotal.toString(),
        description: formData.description,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        vatRate: formData.vatRate,
        vatAmount: vatAmount,
        totalAmount: totalAmount,
        date: formData.date,
        enableVAT: formData.enableVAT,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        subtotal: subtotal.toString()
      };
      
      console.log('📤 Sending income data:', JSON.stringify(incomeData, null, 2));
      
      await api.post<IncomeEntry>('/finance/income', incomeData);
      
      setSuccess('Income entry recorded successfully!');
      resetForm();
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to record income');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      quantity: '',
      unitPrice: '',
      category: '',
      paymentMethod: 'TRANSFER',
      date: new Date().toISOString().split('T')[0],
      enableVAT: false,
      vatRate: 7.5
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Targeted Skeleton Components for Data Only
  const VATAmountSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  );
  const fetchVatRecords = async (isFilterChange = false) => {
    if (!user) return;
    
    // Show loading state immediately for filter changes
    if (isFilterChange) {
      setVatFilterChanging(true);
    }
    setVatLoading(true);
    setError('');
    
    try {
      // Build API query based on date filter - use same logic as reports page
      const offset = (vatCurrentPage - 1) * vatEntriesPerPage;
      
      let params: any = {
        limit: vatEntriesPerPage,
        offset: offset,
        _t: Date.now() // Cache-busting parameter like other functions
      };
      
      // Calculate date range based on filter - same as reports page
      const today = new Date();
      let startDate = '';
      let endDate = '';
      
      switch (vatDateFilter) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = yesterday.toISOString().split('T')[0];
          console.log(`🔍 Yesterday calculation: today=${today.toISOString().split('T')[0]}, yesterday=${yesterday.toISOString().split('T')[0]}`);
          break;
        case 'last7days':
          const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'last30days':
          const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
          startDate = thirtyDaysAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'custom':
          const customDate = new Date(vatSelectedYear, vatSelectedMonth, 1);
          const lastDayOfCustomMonth = new Date(vatSelectedYear, vatSelectedMonth + 1, 0);
          startDate = customDate.toISOString().split('T')[0];
          endDate = lastDayOfCustomMonth.toISOString().split('T')[0];
          break;
        case 'allTime':
          // For all time, don't set date limits
          startDate = '';
          endDate = '';
          break;
      }
      
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      console.log(`💰 Fetching VAT records for user ${user.name} (ID: ${user.id}): dateFilter=${vatDateFilter}, page=${vatCurrentPage}, limit=${vatEntriesPerPage}, isFilterChange=${isFilterChange}`);
      console.log(`📅 Date range: startDate=${startDate}, endDate=${endDate}`);
      
      // Test: Log the exact date objects being created
      if (vatDateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        console.log(`🔍 Yesterday calculation: today=${today.toISOString().split('T')[0]}, yesterday=${yesterday.toISOString().split('T')[0]}`);
      }
      
      // Add more debugging for API call
      console.log('🚀 About to call API with params:', params);
      console.log('🔍 API endpoint:', '/finance/vat/records');
      console.log('🔍 API method:', 'GET');
      
      // Fetch current period data
      const response = await api.get('/finance/vat/records', { params });
      console.log('📊 API response:', response);
      console.log('📊 API response data:', response.data);
      
      const records = response.data?.records || [];
      
      // Update period based on date filter
      const updatedRecords = records.map((record: any) => {
        let updatedPeriod = record.period;
        
        // Override period based on date filter
        if (vatDateFilter === 'last30days') {
          updatedPeriod = 'monthly';
        } else if (vatDateFilter === 'last7days') {
          updatedPeriod = 'weekly';
        } else if (vatDateFilter === 'today' || vatDateFilter === 'yesterday') {
          updatedPeriod = 'daily';
        }
        // For 'custom' and 'allTime', keep the original period from backend
        
        return {
          ...record,
          period: updatedPeriod
        };
      });
      
      // Calculate previous period data for percentage changes
      let previousParams = { ...params };
      let previousStartDate = '';
      let previousEndDate = '';
      
      // Calculate previous period based on current filter
      if (vatDateFilter === 'today') {
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        previousStartDate = yesterday.toISOString().split('T')[0];
        previousEndDate = yesterday.toISOString().split('T')[0];
      } else if (vatDateFilter === 'last7days') {
        const fourteenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
        const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        previousStartDate = fourteenDaysAgo.toISOString().split('T')[0];
        previousEndDate = sevenDaysAgo.toISOString().split('T')[0];
      } else if (vatDateFilter === 'last30days') {
        const sixtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);
        const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        previousStartDate = sixtyDaysAgo.toISOString().split('T')[0];
        previousEndDate = thirtyDaysAgo.toISOString().split('T')[0];
      } else if (vatDateFilter === 'custom') {
        // For custom month, compare with previous month
        const previousMonth = new Date(vatSelectedYear, vatSelectedMonth - 1, 1);
        const lastDayOfPreviousMonth = new Date(vatSelectedYear, vatSelectedMonth, 0);
        previousStartDate = previousMonth.toISOString().split('T')[0];
        previousEndDate = lastDayOfPreviousMonth.toISOString().split('T')[0];
      }
      
      if (previousStartDate && previousEndDate) {
        previousParams.startDate = previousStartDate;
        previousParams.endDate = previousEndDate;
      }
      
      // Fetch previous period data
      let previousRecords = [];
      if (previousStartDate && previousEndDate) {
        try {
          const previousResponse = await api.get('/finance/vat/records', { params: previousParams });
          previousRecords = previousResponse.data?.records || [];
        } catch (error) {
          console.log('Could not fetch previous period data:', error);
        }
      }
      
      // Calculate current period summary
      const totalVat = updatedRecords.reduce((sum: number, record: any) => sum + (record.vatAmount || 0), 0);
      const averageVat = updatedRecords.length > 0 ? totalVat / updatedRecords.length : 0;
      const highestVat = updatedRecords.length > 0 ? Math.max(...updatedRecords.map((r: any) => r.vatAmount || 0)) : 0;
      
      // Calculate previous period summary
      const previousTotalVat = previousRecords.reduce((sum: number, record: any) => sum + (record.vatAmount || 0), 0);
      const previousAverageVat = previousRecords.length > 0 ? previousTotalVat / previousRecords.length : 0;
      const previousHighestVat = previousRecords.length > 0 ? Math.max(...previousRecords.map((r: any) => r.vatAmount || 0)) : 0;
      
      // Calculate percentage changes (handle edge cases)
      const totalVatChange = previousTotalVat > 0 ? ((totalVat - previousTotalVat) / previousTotalVat) * 100 : 
                                 (totalVat > 0 ? 100 : 0); // Show 100% if this is first period with VAT
      const averageVatChange = previousAverageVat > 0 ? ((averageVat - previousAverageVat) / previousAverageVat) * 100 : 
                                   (averageVat > 0 ? 100 : 0);
      const highestVatChange = previousHighestVat > 0 ? ((highestVat - previousHighestVat) / previousHighestVat) * 100 : 
                                   (highestVat > 0 ? 100 : 0);
      
      // Debug: Log the calculation values
      console.log('📈 Percentage calculation debug:', {
        totalVat,
        previousTotalVat,
        totalVatChange,
        averageVat,
        previousAverageVat,
        averageVatChange,
        highestVat,
        previousHighestVat,
        highestVatChange
      });
      
      setVatRecords(updatedRecords);
      setVatSummary({
        totalVat,
        averageVat,
        highestVat,
        totalTransactions: updatedRecords.reduce((sum: number, record: any) => sum + (record.transactionCount || 0), 0)
      });
      setVatPercentageChanges({
        totalVatChange,
        averageVatChange,
        highestVatChange
      });
      setVatTotalPages(Math.ceil(response.data?.total || updatedRecords.length / vatEntriesPerPage));
      setVatTotalRecords(response.data?.total || updatedRecords.length);
      
      console.log(`✅ VAT records fetched successfully: ${updatedRecords.length} records`);
      console.log(`📈 Percentage changes:`, {
        totalVatChange,
        averageVatChange,
        highestVatChange
      });
    } catch (err: any) {
      console.error('Failed to fetch VAT records:', err);
      setError('Failed to fetch VAT records');
    } finally {
      setVatLoading(false);
      setVatFilterChanging(false);
    }
  };
  
  const downloadVatReport = (record: any) => {
    try {
      // Create a simple text report
      const reportContent = `
VAT Remittance Report
==================

Invoice #: ${record.invoiceNumber || `INV-${record.id}`}
Date: ${new Date(record.date).toLocaleDateString()}
Period: ${record.period}
VAT Amount: ${formatCurrency(record.vatAmount?.toString() || '0', { includeSymbol: true })}
Transactions: ${record.transactionCount || 1}
Status: ${record.status}

Generated on: ${new Date().toLocaleString()}
      `;
      
      // Download as text file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vat-report-${record.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('VAT report downloaded successfully');
    } catch (err: any) {
      console.error('Failed to download VAT report:', err);
      setError('Failed to download VAT report');
    }
  };
  
  // VAT Actions modal function
  const handleVatActionsModal = (record: any) => {
    setSelectedVatRecord(record);
    setShowVatActionsModal(true);
  };
  
  const closeVatActionsModal = () => {
    setShowVatActionsModal(false);
    setSelectedVatRecord(null);
  };
  
  const handleVatViewDetails = () => {
    setShowVatActionsModal(false);
    setShowVatDetailsModal(true);
  };
  
  const closeVatDetailsModal = () => {
    setShowVatDetailsModal(false);
  };
  
  const handleMarkAsRemitted = async () => {
    if (!selectedVatRecord) return;
    
    try {
      // Update the record status to 'remitted'
      setVatRecords(vatRecords.map(record => 
        record.id === selectedVatRecord.id 
          ? { ...record, status: 'remitted' }
          : record
      ));
      
      setSuccess('VAT record marked as remitted successfully');
      closeVatActionsModal();
    } catch (err: any) {
      console.error('Failed to mark VAT as remitted:', err);
      setError('Failed to mark VAT as remitted');
    }
  };
  
  const handleVatPageChange = (page: number) => {
    setVatCurrentPage(page);
    fetchVatRecords();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access this feature</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-0">
      <div className="rounded-lg dark:bg-gray-900 p-0">
        <div className="p-0">
          {/*<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Farm Income
          </h2>*/}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-4 overflow-x-auto">
              <button
                onClick={() => handleTabChange('record')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'record'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Plus className="h-4 w-4" />
                Record Income
              </button>
              <button
                onClick={() => handleTabChange('invoice')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'invoice'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                Create Invoice
              </button>
              <button
                onClick={() => handleTabChange('invoices')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Table className="h-4 w-4" />
                Invoice Records
              </button>
              <button
                onClick={() => handleTabChange('records')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'records'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="h-4 w-4 flex items-center justify-center text-sm font-bold">₦</span>
                Income Records
              </button>
              <button
                onClick={() => handleTabChange('vat' as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'vat'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Receipt className="h-4 w-4" />
                VAT Records
              </button>
            </nav>
          </div>

          {/* Record Income Tab */}
          {activeTab === 'record' && (
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Row: Description, Quantity, Unit Price */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      value={formatNumberWithSeparator(formData.quantity)}
                      onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </div>
                  <div>
                    <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit Price (₦) *
                    </label>
                    <input
                      type="text"
                      id="unitPrice"
                      name="unitPrice"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      value={formatNumberWithSeparator(formData.unitPrice)}
                      onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </div>
                </div>

                {/* VAT Option */}
                <div className="p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="enableVAT" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        id="enableVAT"
                        name="enableVAT"
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.enableVAT}
                        onChange={handleChange}
                      />
                      Enable VAT Calculation
                    </label>
                    {formData.enableVAT && (
                      <div className="flex items-center gap-2">
                        <label htmlFor="vatRate" className="text-sm text-gray-600 dark:text-gray-400">
                          VAT Rate:
                        </label>
                        <input
                          type="number"
                          id="vatRate"
                          name="vatRate"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          value={formData.vatRate}
                          onChange={handleChange}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculated Amount Display */}
                <div className="p-4 rounded-lg">
                  {(() => {
                    const quantity = parseFloat((formData.quantity || '0').replace(/,/g, ''));
                    const unitPrice = parseFloat((formData.unitPrice || '0').replace(/,/g, ''));
                    const subtotal = quantity * unitPrice;
                    const vatAmount = formData.enableVAT ? (subtotal * formData.vatRate) / 100 : 0;
                    const totalAmount = subtotal + vatAmount;
                    
                    // Debug logging
                    console.log('💰 Debug - Calculation:', {
                      quantity: formData.quantity,
                      unitPrice: formData.unitPrice,
                      parsedQuantity: quantity,
                      parsedUnitPrice: unitPrice,
                      subtotal: subtotal,
                      vatAmount: vatAmount,
                      totalAmount: totalAmount
                    });
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal:</span>
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(subtotal.toString())}
                          </span>
                        </div>
                        {formData.enableVAT && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              VAT ({formData.vatRate}%):
                            </span>
                            <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                              {formatCurrency(vatAmount.toString())}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(totalAmount.toString())}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Second Row: Category, Payment Method, Date */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {incomeCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method *
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method.charAt(0) + method.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Recording...' : 'Record Income'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Create Invoice Tab */}
          {activeTab === 'invoice' && (
            <div>
              {!generatedInvoice ? (
                <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                  {/* Client Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Client Name *
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="John Doe"
                          value={invoiceData.clientName}
                          onChange={(e) => handleInvoiceChange('clientName', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="john@example.com"
                          value={invoiceData.clientEmail}
                          onChange={(e) => handleInvoiceChange('clientEmail', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="+234-XXX-XXX-XXXX"
                          value={invoiceData.clientPhone}
                          onChange={(e) => handleInvoiceChange('clientPhone', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder="123 Farm Road, City, State"
                          value={invoiceData.clientAddress}
                          onChange={(e) => handleInvoiceChange('clientAddress', e.target.value)}
                        />
                      </div>
                    </div>

                  {/* Invoice Details */}
                  <div className="p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Invoice Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          placeholder={generateInvoiceNumber()}
                          value={invoiceData.invoiceNumber}
                          onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Invoice Date *
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          value={invoiceData.invoiceDate}
                          onChange={(e) => handleInvoiceChange('invoiceDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Due Date *
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          value={invoiceData.dueDate}
                          onChange={(e) => handleInvoiceChange('dueDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Invoice Items */}
                  <div className="p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Invoice Items
                    </h3>
                    <div className="space-y-4">
                      {invoiceData.items.map((item, index) => (
                        <div key={`invoice-item-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description *
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Product or service description"
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Quantity *
                            </label>
                            <input
                              type="text"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                              value={formatNumberWithSeparator(item.quantity)}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 1)}
                              ref={(el) => {
                                if (el) {
                                  console.log('🔍 DEBUG - Quantity Input:', {
                                    hasPlaceholder: el.hasAttribute('placeholder'),
                                    placeholder: el.getAttribute('placeholder'),
                                    value: el.value,
                                    index: index
                                  });
                                  // Force remove placeholder if it exists
                                  if (el.hasAttribute('placeholder')) {
                                    console.log('🗑️ Removing placeholder from quantity input');
                                    el.removeAttribute('placeholder');
                                  }
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Unit Price *
                            </label>
                            <input
                              type="text"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                              value={formatNumberWithSeparator(item.unitPrice)}
                              onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
                              ref={(el) => {
                                if (el) {
                                  console.log('🔍 DEBUG - Unit Price Input:', {
                                    hasPlaceholder: el.hasAttribute('placeholder'),
                                    placeholder: el.getAttribute('placeholder'),
                                    value: el.value,
                                    index: index
                                  });
                                  // Force remove placeholder if it exists
                                  if (el.hasAttribute('placeholder')) {
                                    console.log('🗑️ Removing placeholder from unit price input');
                                    el.removeAttribute('placeholder');
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.total)}
                            </div>
                            {invoiceData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeInvoiceItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addInvoiceItem}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
                    <select
                      value={invoiceData.paymentMethod}
                      onChange={(e) => handleInvoiceChange('paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="CASH">Cash</option>
                      <option value="TRANSFER">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Additional notes or payment instructions..."
                      value={invoiceData.notes}
                      onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                    />
                  </div>

                  {/* Summary */}
                  <div className="p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoiceData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tax (7.5%):</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoiceData.tax)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total:</span>
                        <span className="text-gray-900 dark:text-white">{formatCurrency(invoiceData.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Generate Invoice Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!invoiceData.clientName || !invoiceData.clientEmail || invoiceData.items.some(item => !item.description || !item.unitPrice || parseFloat(item.unitPrice) <= 0)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 sm:p-6 rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      Invoice Generated Successfully!
                    </h3>
                    <p className="text-sm sm:text-base text-green-600 dark:text-green-400 mb-4">
                      Invoice #{generatedInvoice.invoiceNumber} has been created for {generatedInvoice.clientName}
                    </p>
                    
                    {/* Invoice Summary - Mobile Optimized */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 border border-green-200 dark:border-green-700">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Amount:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(generatedInvoice.total || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Due Date:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {generatedInvoice.dueDate ? new Date(generatedInvoice.dueDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400 block">Items:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {generatedInvoice.items?.length || 0} items
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Mobile First Layout */}
                    <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-3">
                      <button
                        onClick={downloadInvoice}
                        className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                      >
                        <Download className="h-4 w-4" />
                        Download Invoice
                      </button>
                      <button
                        onClick={sendInvoice}
                        className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                      >
                        <Send className="h-4 w-4" />
                        Send Invoice
                      </button>
                      <button
                        onClick={resetInvoiceForm}
                        className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium"
                      >
                        Create New Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoice Records Tab */}
          {activeTab === 'invoices' && (
            <div>
              {invoicesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2 text-gray-600">
                    <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                    <span>Loading invoice records...</span>
                  </div>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoice records</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start by creating your first invoice.
                  </p>
                  <button
                    onClick={() => handleTabChange('invoice')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Invoice
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto relative">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          VAT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created by
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {invoices.map((invoice, index) => (
                        <tr key={`invoice-${invoice.id || 'unknown'}-${index}-${invoice.invoiceNumber || 'no-number'}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            #{invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div>
                              <div className="font-medium">{invoice.clientName}</div>
                              <div className="text-gray-500 text-xs">{invoice.clientEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="max-w-xs">
                              {invoice.items?.length > 0 ? (
                                <>
                                  <div className="truncate" title={invoice.items[0]?.description}>
                                    {invoice.items[0]?.description}
                                  </div>
                                  {invoice.items.length > 1 && (
                                    <div className="text-xs text-gray-500">
                                      +{invoice.items.length - 1} more items
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-gray-500">No items</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {invoice.items?.length > 0 ? (
                              <div className="text-xs">
                                {invoice.items.reduce((total: number, item: any) => total + (item.quantity || 0), 0)} items
                              </div>
                            ) : (
                              <div className="text-gray-500">0</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(invoice.subtotal, { includeSymbol: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(invoice.tax, { includeSymbol: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(invoice.total, { includeSymbol: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              invoice.status === 'PAID' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : invoice.dueDate && new Date(invoice.dueDate) > new Date() 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                : invoice.dueDate ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                            }`}>
                              {invoice.status === 'PAID' ? 'Paid' : 
                               invoice.dueDate && new Date(invoice.dueDate) > new Date() ? 'Pending' : 
                               invoice.dueDate ? 'Overdue' : 'No due date'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {invoice.userName || invoice.user?.name || invoice.createdBy || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white relative">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActionsModal(invoice);
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                Actions
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Component - show when there are invoices and data is loaded */}
              {!invoicesLoading && invoices.length > 0 && (
                <>
                  {console.log('🔍 Rendering invoice pagination:', {
                    invoicesLoading,
                    invoicesLength: invoices.length,
                    totalInvoices,
                    invoiceTotalPages,
                    invoiceCurrentPage
                  })}
                  <Pagination
                    currentPage={invoiceCurrentPage}
                    totalPages={invoiceTotalPages}
                    onPageChange={handleInvoicePageChange}
                    entriesPerPage={invoiceEntriesPerPage}
                    totalEntries={totalInvoices}
                  />
                </>
              )}
            </div>
          )}

          {/* Edit Invoice Modal */}
          {showEditModal && editingInvoice && (
            <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Invoice</h3>
                  
                  <div className="space-y-4">
                    {/* Business Information */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Business Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={editingInvoice.businessName || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, businessName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Business Email
                          </label>
                          <input
                            type="email"
                            value={editingInvoice.businessEmail || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, businessEmail: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Business Address
                          </label>
                          <input
                            type="text"
                            value={editingInvoice.businessAddress || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, businessAddress: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Business Phone
                          </label>
                          <input
                            type="tel"
                            value={editingInvoice.businessPhone || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, businessPhone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Invoice Number
                          </label>
                          <input
                            type="text"
                            value={editingInvoice.invoiceNumber || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, invoiceNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Client Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client Name *
                          </label>
                          <input
                            type="text"
                            value={editingInvoice.clientName || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, clientName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client Email *
                          </label>
                          <input
                            type="email"
                            value={editingInvoice.clientEmail || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, clientEmail: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client Phone
                          </label>
                          <input
                            type="tel"
                            value={editingInvoice.clientPhone || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, clientPhone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client Address
                          </label>
                          <input
                            type="text"
                            value={editingInvoice.clientAddress || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, clientAddress: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Invoice Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Invoice Date
                          </label>
                          <input
                            type="date"
                            value={editingInvoice.invoiceDate || editingInvoice.date || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, invoiceDate: e.target.value, date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={editingInvoice.dueDate || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, dueDate: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-medium text-gray-900 dark:text-white">Items</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...(editingInvoice.items || []), {
                              description: '',
                              quantity: '',
                              unitPrice: '',
                              total: 0
                            }];
                            setEditingInvoice({...editingInvoice, items: newItems});
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          + Add Item
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {editingInvoice.items?.map((item: any, index: number) => (
                          <div key={`editing-item-${index}-${item.description || 'no-desc'}`} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                            <div className="md:col-span-2">
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) => {
                                  const newItems = [...editingInvoice.items];
                                  newItems[index].description = e.target.value;
                                  setEditingInvoice({...editingInvoice, items: newItems});
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                value={item.quantity || 0}
                                onChange={(e) => {
                                  const newItems = [...editingInvoice.items];
                                  newItems[index].quantity = parseFloat(e.target.value) || 0;
                                  newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                                  setEditingInvoice({...editingInvoice, items: newItems});
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <input
                                type="number"
                                value={item.unitPrice || 0}
                                onChange={(e) => {
                                  const newItems = [...editingInvoice.items];
                                  newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                  newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                                  setEditingInvoice({...editingInvoice, items: newItems});
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Total"
                                value={item.total || 0}
                                readOnly
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-100 dark:bg-gray-600 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = editingInvoice.items.filter((_: any, i: number) => i !== index);
                                  setEditingInvoice({...editingInvoice, items: newItems});
                                }}
                                className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(editingInvoice.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax (7.5%):</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(((editingInvoice.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0) * 0.075))}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900 dark:text-white">Total:</span>
                          <span className="text-gray-900 dark:text-white">
                            {formatCurrency(((editingInvoice.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0) * 1.075))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Fields */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Additional Information</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Category
                            </label>
                            <select
                              value={editingInvoice.category || 'Sales'}
                              onChange={(e) => setEditingInvoice({...editingInvoice, category: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="Sales">Sales</option>
                              <option value="Services">Services</option>
                              <option value="Investments">Investments</option>
                              <option value="Loans">Loans</option>
                              <option value="Grants">Grants</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Payment Method
                            </label>
                            <select
                              value={editingInvoice.paymentMethod || 'TRANSFER'}
                              onChange={(e) => setEditingInvoice({...editingInvoice, paymentMethod: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="CASH">Cash</option>
                              <option value="TRANSFER">Transfer</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <textarea
                            value={editingInvoice.notes || ''}
                            onChange={(e) => setEditingInvoice({...editingInvoice, notes: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Add any additional notes or terms..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => {
                        // Calculate totals before updating
                        const subtotal = editingInvoice.items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
                        const tax = subtotal * 0.075;
                        const total = subtotal + tax;
                        
                        const updatedInvoice = {
                          ...editingInvoice,
                          subtotal,
                          tax,
                          total
                        };
                        
                        handleUpdateInvoice(updatedInvoice);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1"
                    >
                      Update Invoice
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && invoiceToDelete && (
            <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Delete Invoice</h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Are you sure you want to delete this invoice? This action cannot be undone.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="h-2 w-2 bg-red-100 dark:bg-red-900 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice #{invoiceToDelete.invoiceNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{invoiceToDelete.clientName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{formatCurrency(invoiceToDelete.total.toString())}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-1"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions Modal */}
          {showActionsModal && selectedInvoice && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invoice Actions</h3>
                    <button
                      onClick={closeActionsModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="h-2 w-2 bg-blue-100 dark:bg-blue-900 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Invoice #{selectedInvoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInvoice.clientName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{formatCurrency(selectedInvoice.total, { includeSymbol: true })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        downloadStoredInvoice(selectedInvoice);
                        closeActionsModal();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                      Download Invoice
                    </button>
                    
                    <button
                      onClick={() => {
                        sendInvoice(selectedInvoice);
                        closeActionsModal();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                    >
                      <Send className="h-4 w-4 text-purple-600" />
                      Send Invoice
                    </button>
                    
                    <button
                      onClick={() => {
                        handleViewInvoice(selectedInvoice);
                        closeActionsModal();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                    >
                      <Eye className="h-4 w-4 text-indigo-600" />
                      View Invoice
                    </button>
                    
                    <button
                      onClick={() => {
                        handleEditInvoice(selectedInvoice);
                        closeActionsModal();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                    >
                      <Edit2 className="h-4 w-4 text-green-600" />
                      Edit Invoice
                    </button>
                    
                    {selectedInvoice.status !== 'PAID' && (
                      <button
                        onClick={() => {
                          debouncedMarkAsPaid(selectedInvoice);
                          closeActionsModal();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        Mark as Paid
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        handleDeleteClick(selectedInvoice);
                        closeActionsModal();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View Invoice Modal */}
          {showViewModal && viewingInvoice && (
            <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Invoice #{viewingInvoice.invoiceNumber}
                  </h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingInvoice(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* PDF Viewer */}
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-h-[600px] flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Client: <span className="font-medium text-gray-900 dark:text-white">{viewingInvoice.clientName}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadStoredInvoice(viewingInvoice)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          const invoiceToEmail = viewingInvoice;
                          const subject = `Invoice ${invoiceToEmail.invoiceNumber || 'N/A'} from FarmOps`;
                          const body = `Dear ${invoiceToEmail.clientName || 'Valued Customer'},

                          Thank you for your business. Please find your invoice details below:

                          Invoice Number: ${invoiceToEmail.invoiceNumber || 'N/A'}
                          Amount: ${formatCurrency(invoiceToEmail.total || 0)}
                          Due Date: ${invoiceToEmail.dueDate ? new Date(invoiceToEmail.dueDate).toLocaleDateString() : 'N/A'}

                          Items: ${invoiceToEmail.items?.map((item: any) => 
                            `- ${item.description || 'Item'}: ${item.quantity || 0} × ${formatCurrency(item.unitPrice || item.price || 0, { includeSymbol: false })} = ${formatCurrency(item.total || 0, { includeSymbol: false })}`
                          ).join('\n') || 'No items listed'}

                          Total Amount: ${formatCurrency(invoiceToEmail.total || 0)}

                          Payment Method: ${invoiceToEmail.paymentMethod || 'Bank Transfer'}

                          Thank you for your prompt payment.`;

                          const mailtoLink = `mailto:${invoiceToEmail.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          window.open(mailtoLink, '_blank');
                        }}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </div>
                  </div>

                  {/* Invoice Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex-1 overflow-auto">
                    <div className="max-w-2xl mx-auto">
                      {/* Invoice Header */}
                      <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">INVOICE</h1>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          #{viewingInvoice.invoiceNumber}
                        </div>
                      </div>

                      {/* Business & Client Info */}
                      <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">From:</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p>TrackFarmOps</p>
                            <p>{user?.email || 'farmops@example.com'}</p>
                            <p>+234-XXX-XXX-XXXX</p>
                            <p>Farm Location, Nigeria</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">To:</h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-medium text-gray-900 dark:text-white">{viewingInvoice.clientName}</p>
                            <p>{viewingInvoice.clientEmail}</p>
                            <p>{viewingInvoice.clientPhone || 'N/A'}</p>
                            <p>{viewingInvoice.clientAddress || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Invoice Date:</span> {new Date(viewingInvoice.invoiceDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Due Date:</span> {new Date(viewingInvoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-6">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                              <th className="text-center py-2 text-sm font-semibold text-gray-900 dark:text-white">Quantity</th>
                              <th className="text-right py-2 text-sm font-semibold text-gray-900 dark:text-white">Unit Price</th>
                              <th className="text-right py-2 text-sm font-semibold text-gray-900 dark:text-white">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {viewingInvoice.items?.map((item: any, index: number) => (
                              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-3 text-sm text-gray-900 dark:text-white">{item.description}</td>
                                <td className="py-3 text-sm text-center text-gray-900 dark:text-white">{item.quantity}</td>
                                <td className="py-3 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-3 text-sm text-right text-gray-900 dark:text-white">{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex justify-end">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Subtotal: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingInvoice.subtotal, { includeSymbol: true })}</span>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Tax (7.5%): <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(viewingInvoice.tax, { includeSymbol: true })}</span>
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              Total: <span className="text-xl">{formatCurrency(viewingInvoice.total, { includeSymbol: true })}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {viewingInvoice.notes && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{viewingInvoice.notes}</p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Payment Method: {viewingInvoice.paymentMethod || 'Bank Transfer'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Thank you for your business!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Income Records Tab */}
          {activeTab === 'records' && (
            <div>
              {incomesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2 text-gray-600">
                    <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                    <span>Loading income records...</span>
                  </div>
                </div>
              ) : incomes.length === 0 ? (
                <div className="text-center py-8">
                  <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No income records</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start by recording your first farm income.
                  </p>
                  <button
                    onClick={() => handleTabChange('record')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Income
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          VAT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Approved By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {incomes.map((income, index) => (
                        <tr key={`income-${income.id || 'unknown'}-${index}-${income.date || 'no-date'}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(income.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="max-w-xs truncate" title={income.description || '-'}>
                              {income.description || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {(() => {
                              const displayQty = getDisplayQuantity(income);
                              return displayQty ? (
                                <div className="text-xs">
                                  {displayQty} items
                                </div>
                              ) : (
                                <div className="text-gray-500">0</div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              {income.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              income.paymentMethod === 'CASH' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                            }`}>
                              {income.paymentMethod.charAt(0) + income.paymentMethod.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(income.amount, { includeSymbol: true })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {income.invoiceVat ? formatCurrency(income.invoiceVat, { includeSymbol: true }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                              {(() => {
                                // Check if this income came from an invoice
                                if (income.description?.includes('Payment for invoice #')) {
                                  // First try to use the invoiceCreator field if available
                                  if (income.invoiceCreator) {
                                    return income.invoiceCreator;
                                  }
                                  // Extract invoice creator from description as fallback
                                  const creatorMatch = income.description.match(/\[Invoice Creator: ([^\]]+)\]/);
                                  if (creatorMatch) {
                                    return creatorMatch[1];
                                  }
                                  // Fallback to current user if no creator found
                                  return user?.name || 'System';
                                }
                                // For manual income, show the actual user who created it
                                return income.user?.name || 'Unknown User';
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                              {(() => {
                                // Check if this income came from an invoice
                                if (income.description?.includes('Payment for invoice #')) {
                                  // For invoice-based income, show user who marked it as paid
                                  return income.approvedBy || 'Unknown User';
                                }
                                // For manual income, no approval needed, show same as creator
                                return income.user?.name || 'Unknown User';
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Component - show when there are incomes and data is loaded */}
              {!incomesLoading && incomes.length > 0 && (
                <>
                  {console.log('🔍 Rendering income pagination:', {
                    incomesLoading,
                    incomesLength: incomes.length,
                    totalIncomes,
                    totalPages,
                    currentPage
                  })}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    entriesPerPage={entriesPerPage}
                    totalEntries={totalIncomes}
                  />
                </>
              )}
            </div>
          )}

          {/* VAT Records Tab */}
          {activeTab === 'vat' && (
            <div className="space-y-6">
              {/* Enhanced Header Section */}
              {/*<div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-600 dark:bg-purple-700 rounded-lg shadow-lg">
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">VAT Remittance Tracking</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Monitor and manage your VAT obligations</p>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg">
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-2 rounded-lg">
                      <p className="text-sm font-medium">{success}</p>
                    </div>
                  )}
                </div>
              </div>*/}

              {/* Enhanced Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 dark:border-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total VAT Collected</h3>
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {vatPercentageChanges.totalVatChange > 0 ? '+' : ''}{vatPercentageChanges.totalVatChange.toFixed(1)}%
                        </div>
                        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {vatSummary.totalTransactions} transactions
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg shadow-lg">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {vatFilterChanging ? (
                      <VATAmountSkeleton />
                    ) : (
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(vatSummary.totalVat, { includeSymbol: true })}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 dark:border-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Average VAT</h3>
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {vatPercentageChanges.averageVatChange > 0 ? '+' : ''}{vatPercentageChanges.averageVatChange.toFixed(1)}%
                        </div>
                        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Per transaction
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-lg">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {vatFilterChanging ? (
                      <VATAmountSkeleton />
                    ) : (
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(vatSummary.averageVat, { includeSymbol: true })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 dark:border-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-col space-y-1">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Highest VAT</h3>
                      <div className="flex items-center space-x-2">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {vatPercentageChanges.highestVatChange > 0 ? '+' : ''}{vatPercentageChanges.highestVatChange.toFixed(1)}%
                        </div>
                        <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Single transaction
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg shadow-lg">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  {vatFilterChanging ? (
                    <VATAmountSkeleton />
                  ) : (
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(vatSummary.highestVat, { includeSymbol: true })}
                    </p>
                  )}
                </div>
              </div>

              {/* Enhanced Filter Section - using dashboard design */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
                <div className="overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 min-w-max">
                    {/* Quick Date Buttons */}
                    <button
                      onClick={() => {
                        setVatDateFilter('today');
                        // Force state update before API call
                        setTimeout(() => {
                          fetchVatRecords(true); // Pass true to indicate filter change
                        }, 0);
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        vatDateFilter === 'today'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        setVatDateFilter('yesterday');
                        setTimeout(() => {
                          fetchVatRecords(true);
                        }, 0);
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        vatDateFilter === 'yesterday'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => {
                        setVatDateFilter('last7days');
                        setTimeout(() => {
                          fetchVatRecords(true);
                        }, 0);
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        vatDateFilter === 'last7days'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => {
                        setVatDateFilter('last30days');
                        setTimeout(() => {
                          fetchVatRecords(true);
                        }, 0);
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        vatDateFilter === 'last30days'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => {
                        setVatDateFilter('allTime');
                        setTimeout(() => {
                          fetchVatRecords(true);
                        }, 0);
                      }}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                        vatDateFilter === 'allTime'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      All Time
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <label className="text-xs sm:text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Month:</label>
                      <select
                        value={vatSelectedMonth}
                        onChange={(e) => {
                          setVatSelectedMonth(parseInt(e.target.value));
                          setVatDateFilter('custom');
                          fetchVatRecords(true);
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      >
                        <option value="0">January</option>
                        <option value="1">February</option>
                        <option value="2">March</option>
                        <option value="3">April</option>
                        <option value="4">May</option>
                        <option value="5">June</option>
                        <option value="6">July</option>
                        <option value="7">August</option>
                        <option value="8">September</option>
                        <option value="9">October</option>
                        <option value="10">November</option>
                        <option value="11">December</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <label className="text-xs sm:text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Year:</label>
                      <select
                        value={vatSelectedYear}
                        onChange={(e) => {
                          setVatSelectedYear(parseInt(e.target.value));
                          setVatDateFilter('custom');
                          fetchVatRecords(true);
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced VAT Records Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Table className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                      VAT Remittance Records
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {vatRecords.length} records
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                        {vatDateFilter.charAt(0).toUpperCase() + vatDateFilter.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {vatLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-gray-500 dark:text-gray-400">Loading VAT records...</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Please wait while we fetch your data</p>
                    </div>
                  </div>
                ) : vatRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No VAT Records Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      There are no income entries with VAT enabled in the selected period.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">How to enable VAT:</h4>
                      <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
                        <li>1. Create a new income entry</li>
                        <li>2. Enable the "Enable VAT" toggle</li>
                        <li>3. Set your VAT rate (default: 7.5%)</li>
                        <li>4. Save the entry</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Invoice #</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Period</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">VAT Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Transactions</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {vatRecords.map((record, index) => (
                          <tr key={record.id || index} className="hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                {new Date(record.date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-mono text-xs">{record.invoiceNumber || `INV-${record.id}`}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                record.period === 'daily' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                                record.period === 'weekly' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                record.period === 'monthly' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                record.period === 'yearly' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                              }`}>
                                {record.period === 'daily' && '📅'}
                                {record.period === 'weekly' && '📊'}
                                {record.period === 'monthly' && '📈'}
                                {record.period === 'yearly' && '📋'}
                                <span className="ml-1">
                                  {record.period.charAt(0).toUpperCase() + record.period.slice(1)}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono font-semibold">
                              {vatFilterChanging ? (
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                              ) : (
                                formatCurrency(record.vatAmount?.toString() || '0', { includeSymbol: true })
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                {record.transactionCount || 1}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                record.status === 'remitted' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                                record.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                                'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              }`}>
                                {record.status === 'remitted' && '✅'}
                                {record.status === 'pending' && '⏳'}
                                {record.status === 'overdue' && '⚠️'}
                                <span className="ml-1">
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white relative">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVatActionsModal(record);
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  Actions
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Enhanced VAT Pagination */}
              {!vatLoading && vatRecords.length > 0 && (
                <div className="mt-8 flex flex-col items-center space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {((vatCurrentPage - 1) * vatEntriesPerPage) + 1} to {Math.min(vatCurrentPage * vatEntriesPerPage, vatTotalRecords)} of {vatTotalRecords} records
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVatPageChange(vatCurrentPage - 1)}
                        disabled={vatCurrentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                        Page {vatCurrentPage} of {vatTotalPages}
                      </span>
                      <button
                        onClick={() => handleVatPageChange(vatCurrentPage + 1)}
                        disabled={vatCurrentPage === vatTotalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
                    <select
                      value={vatEntriesPerPage}
                      onChange={(e) => {
                        setVatEntriesPerPage(Number(e.target.value));
                        setVatCurrentPage(1);
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* VAT Actions Modal */}
          {showVatActionsModal && selectedVatRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">VAT Record Actions</h3>
                  <button
                    onClick={closeVatActionsModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      downloadVatReport(selectedVatRecord);
                      closeVatActionsModal();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                    Download VAT Report
                  </button>
                  <button
                    onClick={handleVatViewDetails}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <Eye className="h-4 w-4 text-indigo-600" />
                    View Details
                  </button>
                  <button
                    onClick={handleMarkAsRemitted}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Mark as Remitted
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* VAT Details Modal */}
          {showVatDetailsModal && selectedVatRecord && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">VAT Record Details</h3>
                  <button
                    onClick={closeVatDetailsModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Invoice Number</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                          {selectedVatRecord.invoiceNumber || `INV-${selectedVatRecord.id}`}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {new Date(selectedVatRecord.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Period</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                            selectedVatRecord.period === 'daily' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                            selectedVatRecord.period === 'weekly' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            selectedVatRecord.period === 'monthly' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            selectedVatRecord.period === 'yearly' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                          }`}>
                            {selectedVatRecord.period === 'daily' && '📅'}
                            {selectedVatRecord.period === 'weekly' && '📊'}
                            {selectedVatRecord.period === 'monthly' && '📈'}
                            {selectedVatRecord.period === 'yearly' && '📋'}
                            <span className="ml-1">
                              {selectedVatRecord.period.charAt(0).toUpperCase() + selectedVatRecord.period.slice(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">VAT Amount</label>
                        <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(selectedVatRecord.vatAmount?.toString() || '0', { includeSymbol: true })}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {selectedVatRecord.transactionCount || 1}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                            selectedVatRecord.status === 'remitted' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                            selectedVatRecord.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          }`}>
                            {selectedVatRecord.status === 'remitted' && '✅'}
                            {selectedVatRecord.status === 'pending' && '⏳'}
                            <span className="ml-1">
                              {selectedVatRecord.status.charAt(0).toUpperCase() + selectedVatRecord.status.slice(1)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          downloadVatReport(selectedVatRecord);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Report
                      </button>
                      {selectedVatRecord.status !== 'remitted' && (
                        <button
                          onClick={handleMarkAsRemitted}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark as Remitted
                        </button>
                      )}
                      <button
                        onClick={closeVatDetailsModal}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedIncomePage;
