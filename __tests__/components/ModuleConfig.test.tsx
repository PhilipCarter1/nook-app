import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModuleConfig } from '@/components/ModuleConfig';

// Mock the Supabase client
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  getClient: () => ({
    from: mockFrom,
  }),
}));

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // First call: client_config (no eq)
  mockFrom.mockImplementation((table) => {
    if (table === 'client_config') {
      mockSelect.mockReturnValue({
        single: () => Promise.resolve({
          data: { enabled_modules: ['concierge', 'branding', 'legal_assistant'] },
          error: null,
        }),
      });
      return { select: mockSelect };
    }
    // Second call: properties (with eq)
    if (table === 'properties') {
      mockSelect.mockReturnValue({
        eq: () => ({
          single: () => Promise.resolve({
            data: {
              module_config: {
                concierge: true,
                branding: false,
                legal_assistant: true,
              },
            },
            error: null,
          }),
        }),
      });
      mockUpdate.mockReturnValue({
        eq: () => Promise.resolve({ data: null, error: null }),
      });
      return { select: mockSelect, update: mockUpdate };
    }
    return {};
  });
});

describe('ModuleConfig', () => {
  it('renders module configuration cards', async () => {
    render(<ModuleConfig level="property" propertyId="test-property" />);
    await waitFor(() => expect(screen.getByText('Concierge')).toBeInTheDocument());
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Legal Assistant')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows module status correctly', async () => {
    render(<ModuleConfig level="property" propertyId="test-property" />);
    await waitFor(() => expect(screen.getAllByRole('switch').length).toBe(3));
    const toggles = screen.getAllByRole('switch');
    expect(toggles[0]).toBeChecked(); // Concierge
    expect(toggles[1]).not.toBeChecked(); // Branding
    expect(toggles[2]).toBeChecked(); // Legal Assistant
  });
}); 