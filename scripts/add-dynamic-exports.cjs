const fs = require('fs');
const path = require('path');

const files = [
  'app/tenant/dashboard/page.tsx',
  'app/settings/maintenance/page.tsx',
  'app/contact/page.tsx',
  'app/features/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/users/page.tsx',
  'app/dashboard/tenant/page.tsx',
  'app/dashboard/settings/page.tsx',
  'app/dashboard/payments/history/page.tsx',
  'app/dashboard/payments/page.tsx',
  'app/dashboard/financial/page.tsx',
  'app/dashboard/properties/[id]/apply/page.tsx',
  'app/dashboard/properties/[id]/post-lease/page.tsx',
  'app/dashboard/properties/[id]/page.tsx',
  'app/dashboard/properties/[id]/pre-lease/page.tsx',
  'app/dashboard/properties/page.tsx',
  'app/dashboard/maintenance/page.tsx',
  'app/dashboard/documents/templates/page.tsx',
  'app/dashboard/documents/[id]/page.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/billing/page.tsx',
  'app/maintenance/page.tsx',
  'app/onboarding/page.tsx',
  'app/payments/page.tsx',
  'app/documents/page.tsx'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (!content.includes('export const dynamic = \'force-dynamic\'')) {
      // Add dynamic export after the first line (usually 'use client')
      const lines = content.split('\n');
      const insertIndex = lines[0].includes('use client') ? 1 : 0;
      
      lines.splice(insertIndex, 0, 'export const dynamic = \'force-dynamic\';');
      
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Added dynamic export to ${filePath}`);
    } else {
      console.log(`Dynamic export already exists in ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Dynamic exports added to all authentication pages!'); 