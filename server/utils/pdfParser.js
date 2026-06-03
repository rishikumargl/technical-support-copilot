import pdf from 'pdf-parse';
import fs from 'fs/promises';

export async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}

export async function extractTextFromTXT(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf-8');
    return {
      text,
      pages: 1,
      metadata: {}
    };
  } catch (error) {
    console.error('Error reading TXT file:', error);
    throw error;
  }
}

export async function extractTextFromMarkdown(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf-8');
    return {
      text,
      pages: 1,
      metadata: {}
    };
  } catch (error) {
    console.error('Error reading Markdown file:', error);
    throw error;
  }
}

export async function extractDocumentText(filePath, fileType) {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return extractTextFromPDF(filePath);
    case 'txt':
      return extractTextFromTXT(filePath);
    case 'md':
      return extractTextFromMarkdown(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export default {
  extractTextFromPDF,
  extractTextFromTXT,
  extractTextFromMarkdown,
  extractDocumentText
};
