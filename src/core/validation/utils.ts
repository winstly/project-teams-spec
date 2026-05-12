/**
 * Validation Utilities
 *
 * Shared parsing and formatting utilities for validation modules.
 */

/**
 * Parses YAML-like frontmatter into section key-value pairs.
 * Supports both single-word and multi-word section headers.
 *
 * @param yaml - Raw frontmatter content between --- delimiters
 * @returns Record mapping section names to their raw string content
 */
export function parseFrontmatter(yaml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentSection = '';
  let currentContent: string[] = [];

  const lines = yaml.split('\n');

  for (const line of lines) {
    // Match section headers: supports "Name" and "Multi Word Name"
    if (line.match(/^\w+(\s+\w+)*\s*:/)) {
      // Save previous section
      if (currentSection) {
        result[currentSection] = currentContent.join('\n');
      }

      // Start new section
      const sectionMatch = line.match(/^(\w+(\s+\w+)*)\s*:/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        const value = line.match(/:\s*(.*)/)?.[1] || '';
        if (value.trim()) {
          currentContent = [value];
        } else {
          currentContent = [];
        }
      }
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    result[currentSection] = currentContent.join('\n');
  }

  return result;
}
