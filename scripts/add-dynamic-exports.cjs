const fs = require('fs');
const path = require('path');

// Find all page.tsx files in the dashboard directory
const dashboardDir = path.join(process.cwd(), 'app', 'dashboard');

function addDynamicExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (content.includes('export const dynamic = \'force-dynamic\'')) {
      console.log(`Skipping ${filePath} - already has dynamic export`);
      return;
    }
    
    // Add dynamic export after the first line
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      newLines.push(lines[i]);
      
      // Add dynamic export after the first line (usually 'use client')
      if (i === 0) {
        newLines.push('');
        newLines.push('// Force dynamic rendering');
        newLines.push('export const dynamic = \'force-dynamic\';');
      }
    }
    
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    console.log(`Added dynamic export to ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item === 'page.tsx') {
      addDynamicExport(fullPath);
    }
  }
}

console.log('Adding dynamic exports to all dashboard pages...');
processDirectory(dashboardDir);
console.log('Done!'); 