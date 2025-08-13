'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Building, Users, FileText, Wrench, CreditCard, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
  id: string;
  type: 'property' | 'tenant' | 'maintenance' | 'payment' | 'document';
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ placeholder = "Search properties, tenants, documents...", className = "", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Simulated search results - in real implementation, this would call an API
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulated search results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'property' as const,
        title: 'Sunset Apartments',
        description: '123 Sunset Blvd, Los Angeles, CA',
        url: '/dashboard/properties/1',
        icon: <Building className="h-4 w-4 text-blue-500" />,
        badge: 'Property'
      },
      {
        id: '2',
        type: 'tenant' as const,
        title: 'John Doe',
        description: 'Tenant at Sunset Apartments Unit 2A',
        url: '/dashboard/tenants/2',
        icon: <Users className="h-4 w-4 text-green-500" />,
        badge: 'Tenant'
      },
      {
        id: '3',
        type: 'maintenance' as const,
        title: 'HVAC Repair Request',
        description: 'Maintenance request for Unit 2A',
        url: '/dashboard/maintenance/3',
        icon: <Wrench className="h-4 w-4 text-orange-500" />,
        badge: 'Maintenance'
      },
      {
        id: '4',
        type: 'document' as const,
        title: 'Lease Agreement - John Doe',
        description: 'Lease agreement for Unit 2A',
        url: '/dashboard/documents/4',
        icon: <FileText className="h-4 w-4 text-red-500" />,
        badge: 'Document'
      },
      {
        id: '5',
        type: 'payment' as const,
        title: 'Rent Payment - March 2024',
        description: 'Rent payment received from John Doe',
        url: '/dashboard/payments/5',
        icon: <CreditCard className="h-4 w-4 text-green-500" />,
        badge: 'Payment'
      }
    ].filter(result => 
      result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(mockResults);
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 w-full"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || loading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-nook-purple-600 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex-shrink-0">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-nook-purple-700 truncate">
                          {result.title}
                        </p>
                        {result.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {result.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {result.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : query && !loading ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No results found for "{query}"</p>
                <p className="text-sm">Try searching for properties, tenants, or documents</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 