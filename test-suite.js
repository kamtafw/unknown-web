import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const startTime = new Date().toLocaleTimeString();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

class EnhancedProjectValidator {
  constructor() {
    this.testResults = {
      structure: false,
      lint: false,
      typeCheck: false,
      unitTests: false,
      e2eTests: false,
      coverage: false,
      build: false
    };
    this.startTime = Date.now();
    this.projectStats = {
      totalFiles: 0,
      totalFolders: 0,
      codeLines: 0,
      testFiles: 0
    };
    this.coverageData = {};
  }

  // Enhanced logging with better formatting
  log(message, color = colors.reset, prefix = '') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors.dim}[${timestamp}]${colors.reset} ${prefix}${color}${message}${colors.reset}`);
  }

  logStep(step, message, emoji = '🔍') {
    console.log('\n' + '═'.repeat(80));
    this.log(`${emoji} ${step.toUpperCase()}`, colors.bright + colors.cyan);
    this.log(message, colors.white, '   ');
    console.log('═'.repeat(80));
  }

  logSuccess(message, emoji = '✅') {
    this.log(`${emoji} ${message}`, colors.green, '   ');
  }

  logError(message, emoji = '❌') {
    this.log(`${emoji} ${message}`, colors.red, '   ');
  }

  logWarning(message, emoji = '⚠️') {
    this.log(`${emoji}  ${message}`, colors.yellow, '   ');
  }

  logInfo(message, emoji = 'ℹ️') {
    this.log(`${emoji}  ${message}`, colors.blue, '   ');
  }

  // Analyze project structure and collect stats
  analyzeProject() {
    this.logStep('ANALYSIS', 'Analyzing project structure...', '📊');
    
    const analyzeDirectory = (dir, depth = 0) => {
      if (depth > 10) return; // Prevent infinite recursion
      
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.name.startsWith('.') || item.name === 'node_modules') continue;
          
          if (item.isDirectory()) {
            this.projectStats.totalFolders++;
            analyzeDirectory(fullPath, depth + 1);
          } else if (item.isFile()) {
            this.projectStats.totalFiles++;
            
            // Count lines in code files
            if (this.isCodeFile(item.name)) {
              try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                this.projectStats.codeLines += content.split('\n').length;
              } catch  {
                // Skip files we can't read
              }
            }
            
            // Count test files
            if (this.isTestFile(item.name)) {
              this.projectStats.testFiles++;
            }
          }
        }
      } catch {
        // Skip directories we can't read
      }
    };
    
    analyzeDirectory('./app');
    analyzeDirectory('./e2e');
    analyzeDirectory('./__tests__');
    
    this.logSuccess(`Found ${this.projectStats.totalFiles} files in ${this.projectStats.totalFolders} folders`);
    this.logSuccess(`Code lines: ${this.projectStats.codeLines.toLocaleString()}`);
    this.logSuccess(`Test files: ${this.projectStats.testFiles}`);
  }

  isCodeFile(filename) {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  isTestFile(filename) {
    return filename.includes('.test.') || filename.includes('.spec.') || filename.includes('__tests__');
  }

  async runCommand(command, description, continueOnError = false, timeout = 300000) {
    try {
      this.log(`🔄 ${command}`, colors.blue, '   ');
      const startTime = Date.now();
      
      const output = execSync(command, { 
        encoding: 'utf-8', 
        stdio: 'pipe',
        timeout,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logSuccess(`${description} completed in ${duration}s`);
      return { success: true, output, duration };
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const errorMsg = `${description} failed after ${duration}s: ${error.message}`;
      
      if (continueOnError) {
        this.logWarning(errorMsg);
        return { success: false, output: error.stdout || error.message, duration };
      } else {
        this.logError(errorMsg);
        throw error;
      }
    }
  }

  checkProjectStructure() {
    this.logStep('STRUCTURE', 'Validating project structure...', '🏗️');
    
    const requiredPaths = [
      { path: 'app', type: 'directory', description: 'Source directory' },
      { path: 'package.json', type: 'file', description: 'Package configuration' },
      { path: 'jest.config.mjs', type: 'file', description: 'Jest configuration' },
      { path: 'playwright.config.ts', type: 'file', description: 'Playwright configuration' },
      { path: 'tsconfig.json', type: 'file', description: 'TypeScript configuration' }
    ];

    const optional = [
      { path: 'tailwind.config.js', description: 'Tailwind CSS config' },
      { path: 'next.config.js', description: 'Next.js config' },
      { path: '.eslintrc.json', description: 'ESLint config' }
    ];

    let structureValid = true;
    
    for (const { path: reqPath, type, description } of requiredPaths) {
      if (fs.existsSync(reqPath)) {
        const stats = fs.statSync(reqPath);
        const isCorrectType = type === 'directory' ? stats.isDirectory() : stats.isFile();
        
        if (isCorrectType) {
          this.logSuccess(`${description} found: ${reqPath}`);
        } else {
          this.logError(`${description} exists but wrong type: ${reqPath}`);
          structureValid = false;
        }
      } else {
        this.logError(`${description} missing: ${reqPath}`);
        structureValid = false;
      }
    }

    // Check optional files
    this.log('\nOptional components:', colors.cyan, '   ');
    for (const { path: optPath, description } of optional) {
      if (fs.existsSync(optPath)) {
        this.logInfo(`${description}: ✓`);
      } else {
        this.logInfo(`${description}: ✗`);
      }
    }

    if (!structureValid) {
      throw new Error('Project structure validation failed');
    }

    this.testResults.structure = true;
    this.logSuccess('Project structure validation passed');
  }

  async runLinting() {
    this.logStep('LINT', 'Running comprehensive linting...', '🔍');
    
    try {
      const result = await this.runCommand('npm run lint', 'ESLint analysis');
      this.testResults.lint = result.success;
      
      if (result.success) {
        this.logSuccess('No linting issues found');
      }
      
      return result.success;
    } catch  {
      this.logError('Linting failed - please fix ESLint errors before proceeding');
      return false;
    }
  }

  async runTypeCheck() {
    this.logStep('TYPES', 'Performing TypeScript type checking...', '📝');
    
    const result = await this.runCommand('npx tsc --noEmit --incremental', 'TypeScript analysis');
    this.testResults.typeCheck = result.success;
    
    if (result.success) {
      this.logSuccess('No type errors found');
    } else {
      this.logError('TypeScript errors found - please fix before proceeding');
    }
    
    return result.success;
  }

  async runUnitTests() {
    this.logStep('UNIT', 'Running unit tests with coverage...', '🧪');
    
    const result = await this.runCommand(
      'npm run test:coverage -- --watchAll=false --passWithNoTests --verbose', 
      'Unit tests with coverage'
    );
    
    this.testResults.unitTests = result.success;
    
    if (result.success) {
      this.analyzeCoverageResults();
    } else {
      this.logError('Unit tests failed');
    }
    
    return result.success;
  }

  analyzeCoverageResults() {
    try {
      if (fs.existsSync('coverage/coverage-summary.json')) {
        const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf-8'));
        this.coverageData = coverage.total;
        
        const thresholds = { lines: 80, functions: 80, branches: 80, statements: 80 };
        let coveragePassed = true;
        
        this.log('\nCoverage Analysis:', colors.cyan, '   ');
        console.log('   ┌' + '─'.repeat(50) + '┐');
        
        for (const [metric, threshold] of Object.entries(thresholds)) {
          const percentage = this.coverageData[metric]?.pct || 0;
          const status = percentage >= threshold ? '✅' : '❌';
          const color = percentage >= threshold ? colors.green : colors.red;
          
          if (percentage < threshold) coveragePassed = false;
          
          const bar = this.createProgressBar(percentage, 20);
          console.log(`   │ ${metric.padEnd(12)} ${status} ${color}${percentage.toFixed(1)}%${colors.reset} ${bar} │`);
        }
        
        console.log('   └' + '─'.repeat(50) + '┘');
        
        this.testResults.coverage = coveragePassed;
        
        if (coveragePassed) {
          this.logSuccess('All coverage thresholds met! 🎯');
        } else {
          this.logWarning('Some coverage thresholds not met');
        }
      } else {
        this.logWarning('Coverage report not found');
      }
    } catch (error) {
      this.logWarning(`Could not analyze coverage: ${error.message}`);
    }
  }

  createProgressBar(percentage, width = 20) {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return colors.green + '█'.repeat(filled) + colors.dim + '░'.repeat(empty) + colors.reset;
  }

  async runE2ETests() {
    this.logStep('E2E', 'Running optimized end-to-end tests...', '🎭');
    
    // Check if E2E tests exist
    if (!fs.existsSync('./e2e') || fs.readdirSync('./e2e').length === 0) {
      this.logWarning('No E2E tests found - skipping E2E testing');
      this.testResults.e2eTests = true; // Don't fail if no E2E tests
      return true;
    }
    
    try {
      // Run E2E tests with optimized settings for speed
      const result = await this.runCommand(
        'npx playwright test --project=chromium --reporter=json --workers=2', 
        'Fast E2E tests (Chromium only)',
        true,
        120000 // 2 minute timeout for E2E
      );
      
      this.testResults.e2eTests = result.success;
      
      if (result.success) {
        this.logSuccess('E2E tests passed! 🚀');
        this.analyzeE2EResults();
      } else {
        this.logWarning('E2E tests had issues - check Playwright report');
      }
      
      return result.success;
    } catch (error) {
      this.logError(`E2E tests failed: ${error.message}`);
      return false;
    }
  }

  analyzeE2EResults() {
    try {
      if (fs.existsSync('test-results/results.json')) {
        const results = JSON.parse(fs.readFileSync('test-results/results.json', 'utf-8'));
        const { stats } = results;
        
        this.log('\nE2E Test Results:', colors.cyan, '   ');
        this.logSuccess(`Tests: ${stats.passed} passed, ${stats.failed} failed, ${stats.skipped} skipped`);
        this.logInfo(`Duration: ${(stats.duration / 1000).toFixed(2)}s`);
      }
    } catch  {
      this.logInfo('E2E results analysis skipped');
    }
  }

  async runBuildTest() {
    this.logStep('BUILD', 'Testing production build...', '🏗️');
    
    const result = await this.runCommand('npm run build', 'Production build verification');
    this.testResults.build = result.success;
    
    if (result.success) {
      this.logSuccess('Production build successful! 📦');
      this.analyzeBuildOutput();
    } else {
      this.logError('Build failed - fix errors before deployment');
    }
    
    return result.success;
  }

  analyzeBuildOutput() {
    try {
      if (fs.existsSync('.next')) {
        const buildSize = this.calculateDirectorySize('.next');
        this.logInfo(`Build size: ${this.formatFileSize(buildSize)}`);
      }
    } catch  {
      this.logInfo('Build analysis skipped');
    }
  }

  calculateDirectorySize(dirPath) {
    let size = 0;
    const calculateSize = (dir) => {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          if (item.isDirectory()) {
            calculateSize(fullPath);
          } else if (item.isFile()) {
            size += fs.statSync(fullPath).size;
          }
        }
      } catch  {
        // Skip inaccessible directories
      }
    };
    calculateSize(dirPath);
    return size;
  }

  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  generateFancyReport() {
    this.logStep('REPORT', 'Generating comprehensive test report...', '📋');
    
    const endTime = Date.now();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    
    console.log('\n' + '╔' + '═'.repeat(78) + '╗');
    console.log(`║${colors.bright}${colors.cyan}                    🚀 PROJECT VALIDATION REPORT 🚀                    ${colors.reset}║`);
    console.log('╠' + '═'.repeat(78) + '╣');
    
    // Project stats
    console.log('║ PROJECT STATISTICS:'.padEnd(79) + '║');
    console.log(`║   📁 Files: ${this.projectStats.totalFiles} | 📂 Folders: ${this.projectStats.totalFolders} | 📄 Lines: ${this.projectStats.codeLines.toLocaleString()} | 🧪 Tests: ${this.projectStats.testFiles}`.padEnd(79) + '║');
    console.log(`║   ⏱️  Total Runtime: ${duration}s`.padEnd(79) + '║');
    console.log('╠' + '═'.repeat(78) + '╣');
    
    // Test results
    const results = [
      ['🏗️  Project Structure', this.testResults.structure],
      ['🔍 ESLint Analysis', this.testResults.lint],
      ['📝 TypeScript Check', this.testResults.typeCheck],
      ['🧪 Unit Tests', this.testResults.unitTests],
      ['📊 Coverage Thresholds', this.testResults.coverage],
      ['🎭 E2E Tests', this.testResults.e2eTests],
      ['📦 Production Build', this.testResults.build]
    ];

    let allPassed = true;
    let passedCount = 0;

    for (const [test, passed] of results) {
      if (passed) passedCount++;
      const status = passed ? 
        `${colors.green}✅ PASS${colors.reset}` : 
        `${colors.red}❌ FAIL${colors.reset}`;
      const line = `║ ${test.padEnd(30)} ${status}`.padEnd(79) + '║';
      console.log(line);
      if (!passed) allPassed = false;
    }
    
    console.log('╠' + '═'.repeat(78) + '╣');
    
    // Coverage details
    if (this.coverageData && Object.keys(this.coverageData).length > 0) {
      console.log('║ COVERAGE BREAKDOWN:'.padEnd(79) + '║');
      for (const [metric, data] of Object.entries(this.coverageData)) {
        if (metric !== 'pct' && data.pct !== undefined) {
          const bar = this.createProgressBar(data.pct, 15);
          const line = `║   ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${data.pct.toFixed(1)}% ${bar}`.padEnd(79) + '║';
          console.log(line);
        }
      }
      console.log('╠' + '═'.repeat(78) + '╣');
    }
    
    // Final result
    const successRate = ((passedCount / results.length) * 100).toFixed(1);
    if (allPassed) {
      console.log(`║${colors.bgGreen}${colors.white}                    🎉 ALL TESTS PASSED! (100%)                      ${colors.reset}║`);
      console.log(`║${colors.green}                  ✨ Ready for production deployment! ✨                 ${colors.reset}║`);
    } else {
      console.log(`║${colors.bgYellow}${colors.black}               ⚠️  TESTS PARTIALLY PASSED (${successRate}%)                ⚠️                ${colors.reset}║`);
      console.log(`║${colors.yellow}                     Please fix failing tests before deployment                ${colors.reset}║`);
    }
    
    console.log('╚' + '═'.repeat(78) + '╝');
    
    // Generate file links
    this.generateReportLinks();
    
    return allPassed;
  }

  generateReportLinks() {
    const reports = [
      { file: 'coverage/lcov-report/index.html', name: '📊 Coverage Report', icon: '🔍' },
      { file: 'playwright-report/index.html', name: '🎭 E2E Report', icon: '🚀' },
      { file: 'coverage/coverage-summary.json', name: '📈 Coverage Data', icon: '📋' }
    ];

    const availableReports = reports.filter(report => fs.existsSync(report.file));
    
    if (availableReports.length > 0) {
      this.log('\n📋 Available Reports:', colors.cyan);
      for (const report of availableReports) {
        const fullPath = path.resolve(report.file);
        this.log(`${report.icon} ${report.name}: file://${fullPath}`, colors.blue, '   ');
      }
    }
  }

  async runAll() {
    try {
      this.log(`${colors.bright}${colors.magenta}🚀 Enhanced Project Validation Suite Starting...${colors.reset}\n`);
      
      // Project analysis
      this.analyzeProject();
      
      // Run all validations
      this.checkProjectStructure();
      await this.runLinting();
      await this.runTypeCheck();
      await this.runUnitTests();
      await this.runE2ETests();
      await this.runBuildTest();
      
      // Generate comprehensive report
      const success = this.generateFancyReport();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.logError(`Validation suite failed: ${error.message}`);
      console.log('\n' + '╔' + '═'.repeat(78) + '╗');
      console.log(`║${colors.bgRed}${colors.white}                       ❌ VALIDATION FAILED ❌                         ${colors.reset}║`);
      console.log(`║${colors.red}                    Please fix the issues and try again                    ${colors.reset}║`);
      console.log('╚' + '═'.repeat(78) + '╝');
      process.exit(1);
    }
  }

  // Quick test mode - skip E2E and build
  async runQuick() {
    try {
      this.log(`${colors.bright}${colors.blue}⚡ Quick Validation Mode - Core Tests Only${colors.reset}\n`);
      
      this.analyzeProject();
      this.checkProjectStructure();
      await this.runLinting();
      await this.runTypeCheck();
      await this.runUnitTests();
      
      const success = this.generateFancyReport();
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.logError(`Quick validation failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// CLI handling
const args = process.argv.slice(2);
const mode = args[0] || 'full';

if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new EnhancedProjectValidator();
  
  switch (mode) {
    case 'quick':
    case 'q':
      validator.runQuick();
      break;
    case 'full':
    case 'f':
    default:
      validator.runAll();
      break;
  }
}

export default EnhancedProjectValidator;