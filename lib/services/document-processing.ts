import { createClient } from '@supabase/supabase-js';
// import Tesseract from 'tesseract.js'; // Temporarily disabled for Vercel deployment
// import { PDFDocument } from 'pdf-lib'; // Temporarily disabled for Vercel deployment

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ProcessedDocument {
  id: string;
  text: string;
  metadata: {
    pageCount: number;
    wordCount: number;
    extractedFields: Record<string, string>;
  };
}

export async function processDocument(file: File): Promise<ProcessedDocument> {
  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Process based on file type
    let text = '';
    let pageCount = 1;
    let extractedFields: Record<string, string> = {};

    if (file.type === 'application/pdf') {
      const result = await processPDF(file);
      text = result.text;
      pageCount = result.pageCount;
      extractedFields = result.extractedFields;
    } else if (file.type.startsWith('image/')) {
      const result = await processImage(file);
      text = result.text;
      extractedFields = result.extractedFields;
    } else if (file.type.includes('word')) {
      const result = await processWordDocument(file);
      text = result.text;
      pageCount = result.pageCount;
      extractedFields = result.extractedFields;
    }

    // Calculate word count
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Store processed document in database
    const { data: processedDoc, error: dbError } = await supabase
      .from('processed_documents')
      .insert({
        id: crypto.randomUUID(),
        original_file: fileName,
        text,
        metadata: {
          pageCount,
          wordCount,
          extractedFields,
        },
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return processedDoc;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

async function processPDF(file: File) {
  // Mock PDF processing for Vercel deployment
  const pageCount = 1; // Mock page count
  const text = `PDF content from ${file.name}`;
  const extractedFields: Record<string, string> = {};

  // Extract common fields
  extractedFields.date = extractDate(text);
  extractedFields.amount = extractAmount(text);
  extractedFields.parties = extractParties(text);

  return {
    text,
    pageCount,
    extractedFields,
  };
}

async function processImage(file: File) {
  // Mock OCR result for Vercel deployment
  const text = `Image content from ${file.name}`;
  const extractedFields: Record<string, string> = {};

  // Extract common fields
  extractedFields.date = extractDate(text);
  extractedFields.amount = extractAmount(text);
  extractedFields.parties = extractParties(text);

  return {
    text,
    extractedFields,
  };
}

async function processWordDocument(file: File) {
  // Convert Word document to text
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder().decode(arrayBuffer);
  const extractedFields: Record<string, string> = {};

  // Extract common fields
  extractedFields.date = extractDate(text);
  extractedFields.amount = extractAmount(text);
  extractedFields.parties = extractParties(text);

  // Estimate page count based on word count
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const pageCount = Math.ceil(wordCount / 500); // Assuming 500 words per page

  return {
    text,
    pageCount,
    extractedFields,
  };
}

function extractDate(text: string): string {
  // Common date patterns
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g, // MM/DD/YYYY
    /\d{1,2}-\d{1,2}-\d{2,4}/g,   // MM-DD-YYYY
    /\d{1,2}\.\d{1,2}\.\d{2,4}/g, // MM.DD.YYYY
    /\d{4}-\d{2}-\d{2}/g,         // YYYY-MM-DD
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return '';
}

function extractAmount(text: string): string {
  // Look for currency amounts
  const amountPattern = /\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
  const match = text.match(amountPattern);
  return match ? match[0] : '';
}

function extractParties(text: string): string {
  // Look for common party indicators
  const partyPatterns = [
    /(?:landlord|tenant|lessor|lessee|buyer|seller):\s*([^\n]+)/gi,
    /(?:between|by and between)\s+([^:]+)/gi,
  ];

  for (const pattern of partyPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return '';
}

export async function searchDocuments(query: string) {
  try {
    const { data, error } = await supabase
      .from('processed_documents')
      .select('*')
      .textSearch('text', query);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

export async function getDocumentText(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('processed_documents')
      .select('text')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return data?.text || '';
  } catch (error) {
    console.error('Error getting document text:', error);
    throw error;
  }
}

export async function getDocumentMetadata(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('processed_documents')
      .select('metadata')
      .eq('id', documentId)
      .single();

    if (error) throw error;
    return data?.metadata || {};
  } catch (error) {
    console.error('Error getting document metadata:', error);
    throw error;
  }
} 