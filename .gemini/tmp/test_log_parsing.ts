import { groupLogLines } from '../../lib/log-utils'; // Corrected import path
import * as fs from 'fs';
import * as path from 'path';

async function runTest() {
  const logFilePath = path.join(process.cwd(), 'public/logs/java/application.log');
  const fileContent = fs.readFileSync(logFilePath, 'utf8');
  const logStrings = fileContent.split('\n');

  // Process a few lines including the multi-line error example
  const linesToProcess = logStrings.slice(0, 20); // Get first 20 lines for better context

  const groupedLogs = groupLogLines(linesToProcess);

  console.log(JSON.stringify(groupedLogs, null, 2));

  // Test the specific multi-line error log
  const multiLineErrorIndex = logStrings.findIndex(line => line.includes("ORA-00942"));
  if (multiLineErrorIndex !== -1) {
    // Get line before, error, and next 3 lines, ensuring not to go out of bounds
    const startIndex = Math.max(0, multiLineErrorIndex - 1);
    const endIndex = Math.min(logStrings.length, multiLineErrorIndex + 5);
    const errorLogSnippet = logStrings.slice(startIndex, endIndex);
    console.log('\n--- Testing multi-line error log ---');
    console.log('Snippet:\n', errorLogSnippet.join('\n'));
    const groupedErrorLogs = groupLogLines(errorLogSnippet);
    console.log('Grouped Error Log:\n', JSON.stringify(groupedErrorLogs, null, 2));
  }
}

runTest();