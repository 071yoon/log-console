import { GroupedLogLine } from '../types';

// A simple ID generator for log lines.
// Using a prefix and an incrementing number is sufficient for unique keys in this context.
let logIdCounter = 0;
const generateLogId = () => `log-${logIdCounter++}`;


// Regex to detect common timestamp patterns at the beginning of a log line.
// Examples:
// [2023-10-27 10:00:00.123]
// 2023-10-27T10:00:00.123Z
// Oct 27 10:00:00
const TIMESTAMP_REGEX =
  /^\s*(\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(.\d{3})?\]|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z|\w{3} \d{1,2} \d{2}:\d{2}:\d{2})/;

// Regex for Java log format: YYYY-MM-DD HH:MM:SS.ms [thread-name] LEVEL class.name - message
const JAVA_LOG_REGEX =
  /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})\s+\[(.*?)\]\s+([A-Z]+)\s+([a-zA-Z0-9\._-]+)\s+-\s+(.*)/;

export function groupLogLines(logStrings: string[]): GroupedLogLine[] {
  const groupedLogs: GroupedLogLine[] = [];
  logIdCounter = 0; // Reset counter for each file processing

  for (const line of logStrings) {
    const javaMatch = line.match(JAVA_LOG_REGEX);

    if (javaMatch) {
      // This line matches the Java log format, so it's a new main log entry
      groupedLogs.push({
        id: generateLogId(),
        mainLine: line,
        subLines: [],
        timestamp: javaMatch[1],
        thread: javaMatch[2],
        level: javaMatch[3],
        logger: javaMatch[4],
        message: javaMatch[5].trim(),
      });
    } else if (TIMESTAMP_REGEX.test(line)) {
      // This line starts with a general timestamp, so it's a new main log entry
      groupedLogs.push({ id: generateLogId(), mainLine: line, subLines: [] });
    } else if (groupedLogs.length > 0) {
      // This line doesn't start with a timestamp, so it's a sub-line of the previous entry
      groupedLogs[groupedLogs.length - 1].subLines.push(line);
    } else {
      // No timestamp, and no previous log to attach to. Treat as a main line.
      // This can happen if the very first line of the log file doesn't have a timestamp.
      groupedLogs.push({ id: generateLogId(), mainLine: line, subLines: [] });
    }
  }

  return groupedLogs;
}
