import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LegalValidationResult {
  isValid: boolean;
  issues: string[];
  stateCompliance: {
    state: string;
    isCompliant: boolean;
    requirements: string[];
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface StateRequirement {
  state: string;
  requirements: {
    category: string;
    rules: string[];
  }[];
}

// State-specific requirements database
const STATE_REQUIREMENTS: Record<string, StateRequirement> = {
  'CA': {
    state: 'California',
    requirements: [
      {
        category: 'Lease Agreement',
        rules: [
          'Must include rent control information if applicable',
          'Must specify security deposit limits',
          'Must include lead paint disclosure',
          'Must specify notice periods for rent increases',
        ],
      },
      {
        category: 'Security Deposit',
        rules: [
          'Maximum 2 months rent for unfurnished units',
          'Maximum 3 months rent for furnished units',
          'Must be returned within 21 days',
        ],
      },
    ],
  },
  'NY': {
    state: 'New York',
    requirements: [
      {
        category: 'Lease Agreement',
        rules: [
          'Must include rent stabilization information if applicable',
          'Must specify security deposit handling',
          'Must include lead paint disclosure',
          'Must specify notice periods for rent increases',
        ],
      },
      {
        category: 'Security Deposit',
        rules: [
          'Must be held in interest-bearing account',
          'Must be returned within 14 days',
        ],
      },
    ],
  },
  // Add more states as needed
};

export async function validateDocument(
  documentId: string,
  state: string,
  documentType: string
): Promise<LegalValidationResult> {
  try {
    // Get document text
    const { data: document, error: docError } = await supabase
      .from('processed_documents')
      .select('text')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // Get state requirements
    const stateRequirements = STATE_REQUIREMENTS[state] || {
      state,
      requirements: [],
    };

    // Use OpenAI to analyze document
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a legal assistant specializing in ${state} real estate law. Analyze the following document for compliance with ${state} requirements.`,
        },
        {
          role: 'user',
          content: `Document Type: ${documentType}\n\nDocument Text:\n${document.text}\n\nState Requirements:\n${JSON.stringify(
            stateRequirements,
            null,
            2
          )}`,
        },
      ],
      temperature: 0.3,
    });

    const analysis = completion.choices[0].message.content;
    if (!analysis) throw new Error('No analysis content returned');
    const parsedAnalysis = JSON.parse(analysis);

    // Store validation result
    const { error: validationError } = await supabase
      .from('document_validations')
      .insert({
        document_id: documentId,
        state,
        result: parsedAnalysis,
        validated_at: new Date().toISOString(),
      });

    if (validationError) throw validationError;

    return parsedAnalysis;
  } catch (error) {
    log.error('Error validating document:', error as Error);
    throw error;
  }
}

export async function getLegalRecommendations(
  documentId: string,
  state: string
): Promise<string[]> {
  try {
    const { data: document, error: docError } = await supabase
      .from('processed_documents')
      .select('text')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a legal assistant specializing in ${state} real estate law. Provide specific recommendations for improving the following document to ensure compliance with ${state} requirements.`,
        },
        {
          role: 'user',
          content: `Document Text:\n${document.text}`,
        },
      ],
      temperature: 0.3,
    });

    const recommendations = completion.choices[0].message.content;
    if (!recommendations) throw new Error('No recommendations content returned');
    return JSON.parse(recommendations as string);
  } catch (error) {
    log.error('Error getting legal recommendations:', error as Error);
    throw error;
  }
}

export async function checkCompliance(
  documentId: string,
  state: string,
  category: string
): Promise<boolean> {
  try {
    const { data: document, error: docError } = await supabase
      .from('processed_documents')
      .select('text')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    const stateRequirements = STATE_REQUIREMENTS[state];
    if (!stateRequirements) {
      throw new Error(`No requirements found for state: ${state}`);
    }

    const categoryRequirements = stateRequirements.requirements.find(
      (req) => req.category === category
    );
    if (!categoryRequirements) {
      throw new Error(`No requirements found for category: ${category}`);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a legal assistant specializing in ${state} real estate law. Check if the following document complies with the specified requirements.`,
        },
        {
          role: 'user',
          content: `Document Text:\n${document.text}\n\nRequirements:\n${JSON.stringify(
            categoryRequirements.rules,
            null,
            2
          )}`,
        },
      ],
      temperature: 0.3,
    });

    const complianceCheck = completion.choices[0].message.content;
    if (!complianceCheck) throw new Error('No compliance check content returned');
    return JSON.parse(complianceCheck as string);
  } catch (error) {
    log.error('Error checking compliance:', error as Error);
    throw error;
  }
}

export async function getStateRequirements(state: string): Promise<StateRequirement> {
  return STATE_REQUIREMENTS[state] || {
    state,
    requirements: [],
  };
} 