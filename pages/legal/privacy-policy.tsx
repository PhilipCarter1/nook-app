import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import LegalDocument from '../../components/legal/LegalDocument';

interface PrivacyPolicyProps {
  content: string;
  lastUpdated: string;
}

export default function PrivacyPolicy({ content, lastUpdated }: PrivacyPolicyProps) {
  return (
    <LegalDocument
      title="Privacy Policy"
      content={content}
      lastUpdated={lastUpdated}
    />
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const filePath = path.join(process.cwd(), 'public/legal/privacy-policy.md');
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