import * as fs from 'fs';
import * as path from 'path';

// --- Type Definitions ---
type CovMetric = { total: number; covered: number; pct: number };
type FileCov = { lines: CovMetric; statements: CovMetric; functions: CovMetric; branches: CovMetric };
type Summary = Record<string, FileCov> & { total: FileCov };

interface ModuleAudit {
  name: string;
  coverage: { files: number; pct: number };
  risks: string[];
  nextSteps: string[];
}

// --- Constants ---
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const COVERAGE_SUMMARY_PATH = path.join(ROOT_DIR, 'coverage', 'coverage-summary.json');
const REPORT_PATH = path.join(DOCS_DIR, 'progress-report.md');

// --- Helper Functions ---
const normalizePath = (p: string) => p.replace(/\\/g, '/');

function loadCoverageSummary(): Summary {
  if (!fs.existsSync(COVERAGE_SUMMARY_PATH)) {
    throw new Error(`Coverage summary not found at '${COVERAGE_SUMMARY_PATH}'. Please run 'npm run test:cov' first.`);
  }
  const summary = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_PATH, 'utf-8'));
  if (!summary.total) {
      throw new Error('Invalid coverage summary format: `total` property is missing.');
  }
  return summary;
}

function aggregateModuleCoverage(summary: Summary, moduleName: string): { files: number; pct: number } {
  let totalLines = 0;
  let coveredLines = 0;
  let fileCount = 0;

  for (const file in summary) {
    if (file === 'total') continue;

    // file path from summary is absolute, convert it to relative to the project root
    const relativePath = path.relative(ROOT_DIR, file);
    const normalizedFile = normalizePath(relativePath);

    if (normalizedFile.startsWith(`src/${moduleName}/`)) {
      const fileCov = summary[file].lines;
      totalLines += fileCov.total;
      coveredLines += fileCov.covered;
      fileCount++;
    }
  }

  if (fileCount === 0) {
    return { files: 0, pct: 0 };
  }

  const percentage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 100;
  return { files: fileCount, pct: parseFloat(percentage.toFixed(2)) };
}

function generateMarkdown(modules: ModuleAudit[], overallCoverage: FileCov): string {
  const totalModules = modules.length;
  const testedModules = modules.filter(m => m.coverage.files > 0).length;

  const tableRows = modules.map(mod => {
    const coverageText = mod.coverage.files > 0 ? `${mod.coverage.pct}%` : '0% (ไม่มีไฟล์ครอบคลุม)';
    return `| ${mod.name} | ${mod.coverage.files} | ${coverageText} | ${mod.risks.join(', ')} | ${mod.nextSteps.join(', ')} |`;
  }).join('\n');

  return `# Project Progress Report

*This report is auto-generated on: ${new Date().toUTCString()}*

## Overview

| Total Modules | Tested Modules | Overall Line Coverage |
|---|---|---|
| ${totalModules} | ${testedModules} | **${overallCoverage.lines.pct}%** |

## Module Breakdown

| Module | Files Covered | Coverage % | Risks / Blockers | Next Steps |
|---|---|---|---|---|
${tableRows}
`;
}

// --- Main Execution ---
async function main() {
  console.log('Generating project audit report...');

  const summary = loadCoverageSummary();
  const moduleNames = fs.readdirSync(SRC_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const auditedModules: ModuleAudit[] = moduleNames.map(name => {
    const coverage = aggregateModuleCoverage(summary, name);
    const risks: string[] = [];
    const nextSteps: string[] = [];

    if (coverage.files === 0) {
      risks.push('No tests');
      nextSteps.push('Write initial tests (spec, e2e)');
    } else if (coverage.pct < 50) {
      risks.push('Low coverage');
      nextSteps.push('Increase test coverage to > 80%');
    }

    if (risks.length === 0) risks.push('None');
    if (nextSteps.length === 0) nextSteps.push('Maintain coverage');

    return { name, coverage, risks, nextSteps };
  });

  const markdown = generateMarkdown(auditedModules, summary.total);

  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  fs.writeFileSync(REPORT_PATH, markdown);
  console.log(`✅ Report successfully generated at: ${REPORT_PATH}`);
}

main().catch(error => {
  console.error('Error generating audit report:', error);
  process.exit(1);
});
