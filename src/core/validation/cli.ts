/**
 * Validation CLI
 *
 * Command-line interface for running validation checks.
 */

import { validateProject, validateFile, type ValidationReport, type FileValidationResult } from './index.js';
import { resolve } from 'path';

interface CLIOptions {
  type?: 'skill' | 'agent' | 'command' | 'all';
  path?: string;
  verbose?: boolean;
  json?: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    type: 'all',
    verbose: false,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--type' || arg === '-t') {
      const type = args[++i];
      if (['skill', 'agent', 'command', 'all'].includes(type)) {
        options.type = type as CLIOptions['type'];
      }
    } else if (arg === '--path' || arg === '-p') {
      options.path = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--json' || arg === '-j') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Validation CLI - Check project files for compliance

Usage:
  node cli.js [options]

Options:
  --type, -t <type>    Validation type: skill, agent, command, all (default: all)
  --path, -p <path>    Specific file or directory to validate
  --verbose, -v        Show detailed output
  --json, -j           Output as JSON
  --help, -h           Show this help message

Examples:
  node cli.js                         Validate all project files
  node cli.js --type skill            Validate only skill files
  node cli.js --path ./config/agents  Validate specific directory
`);
}

function printReport(report: ValidationReport, verbose: boolean = false) {
  const { summary, files } = report;

  console.log('\n=== Validation Report ===');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Files checked: ${summary.total}`);
  console.log(`Passed: ${summary.passed}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Warnings: ${summary.warnings}`);

  if (verbose) {
    console.log('\n--- File Details ---');
    for (const file of files) {
      const status = file.result.valid ? '✓' : '✗';
      console.log(`\n${status} ${file.path} (${file.type})`);

      if (file.result.errors.length > 0) {
        console.log('  Errors:');
        for (const error of file.result.errors) {
          console.log(`    - ${error.field}: ${error.message}`);
        }
      }

      if (file.result.warnings.length > 0) {
        console.log('  Warnings:');
        for (const warning of file.result.warnings) {
          console.log(`    - ${warning.field}: ${warning.message}`);
          if (warning.suggestion) {
            console.log(`      Suggestion: ${warning.suggestion}`);
          }
        }
      }
    }
  } else {
    // Show only failed files
    const failed = files.filter(f => !f.result.valid);
    if (failed.length > 0) {
      console.log('\n--- Failed Files ---');
      for (const file of failed) {
        console.log(`✗ ${file.path}`);
        for (const error of file.result.errors) {
          console.log(`  - ${error.field}: ${error.message}`);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(22));
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const basePath = options.path
    ? resolve(process.cwd(), options.path)
    : resolve(process.cwd());

  const includeTypes: ('skill' | 'agent' | 'command')[] = [];
  if (options.type === 'all' || !options.type) {
    includeTypes.push('skill', 'agent', 'command');
  } else {
    includeTypes.push(options.type as 'skill' | 'agent' | 'command');
  }

  console.log(`Validating ${includeTypes.join(', ')} files...`);

  const report = validateProject(basePath, { includeTypes });

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, options.verbose);
  }

  // Exit with error code if validation failed
  if (report.summary.failed > 0) {
    process.exit(1);
  }
}

// Run if executed directly
main().catch(error => {
  console.error('Validation failed:', error.message);
  process.exit(1);
});

export { parseArgs, printHelp, printReport };