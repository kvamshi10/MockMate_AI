import mammoth from "mammoth";

/**
 * Parses various file types into plain text.
 * Supported: .pdf, .docx, .txt
 */
export async function parseFileToText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  try {
    if (extension === "pdf") {
      return await parsePdf(file);
    } else if (extension === "docx") {
      return await parseDocx(file);
    } else if (extension === "txt") {
      return await parseTxt(file);
    } else {
      throw new Error(`Unsupported file type: .${extension}`);
    }
  } catch (error) {
    console.error(`Error parsing ${file.name}:`, error);
    return ""; // Return empty string on failure
  }
}

async function parsePdf(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("PDF parsing is only supported in the browser.");
  }
  
  // Dynamically import to prevent SSR errors (DOMMatrix is not defined)
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText.trim();
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

async function parseTxt(file: File): Promise<string> {
  return await file.text();
}
