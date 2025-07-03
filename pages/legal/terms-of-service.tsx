import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import LegalDocument from '../../components/legal/LegalDocument';

interface TermsOfServiceProps {
  content: string;
  lastUpdated: string;
}

export default function TermsOfService({ content, lastUpdated }: TermsOfServiceProps) {
  return (
    <LegalDocument
      title="Terms of Service"
      content={content}
      lastUpdated={lastUpdated}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'public/legal/terms-of-service.md');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the last updated date from the content
  const lastUpdatedMatch = content.match(/Last updated: (.*)/);
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : 'Unknown';

  return {
    props: {
      content,
      lastUpdated,
    },
  };
}; 