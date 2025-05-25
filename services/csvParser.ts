
export interface CSVParseResult {
  headers: string[];
  data: Array<Record<string, string>>;
  error?: string;
}

export function parseCSV(csvString: string): CSVParseResult {
  try {
    const lines = csvString.trim().split(/\r\n|\n/);
    if (lines.length === 0) {
      return { headers: [], data: [], error: "CSV is empty" };
    }

    // Basic CSV parsing: split by comma. Doesn't handle quotes or escaped commas.
    const headers = lines[0].split(',').map(h => h.trim());
    const data: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue; // Skip empty lines
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        // Warning or error for mismatched row length
        console.warn(`Row ${i+1} has ${values.length} values, expected ${headers.length}. Skipping.`);
        continue;
      }
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    if (data.length === 0 && lines.length > 1) {
        return { headers, data, error: "CSV has headers but no data rows, or data rows are malformed." };
    }
    
    return { headers, data };
  } catch (e) {
    console.error("Error parsing CSV:", e);
    return { headers: [], data: [], error: e instanceof Error ? e.message : String(e) };
  }
}
