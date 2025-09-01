'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      // Test 1: Environment Variables
      addResult('Environment Variables', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        anonKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + '...'
      });

      // Test 2: Supabase Client Creation
      const supabase = createClient();
      addResult('Supabase Client', { created: true });

      // Test 3: Test Authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      addResult('Current Session', { data: sessionData, error: sessionError });

      // Test 4: Test Login with Test User
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'Test123!'
      });
      addResult('Test Login (admin@test.com)', { data: loginData, error: loginError });

      // Test 5: Test Database Access
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      addResult('Database Access (users table)', { data: usersData, error: usersError });

      // Test 6: Test Auth Users Table (if accessible)
      try {
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('auth.users')
          .select('*')
          .limit(5);
        addResult('Auth Users Table', { data: authUsersData, error: authUsersError });
      } catch (e) {
        addResult('Auth Users Table', { error: 'Not accessible (expected)', details: e });
      }

    } catch (error) {
      addResult('General Error', { error: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Tool</CardTitle>
            <p className="text-gray-600">This tool helps diagnose authentication issues</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isLoading}
              className="mb-6"
            >
              {isLoading ? 'Running Tests...' : 'Run Authentication Tests'}
            </Button>

            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{result.test}</CardTitle>
                    <p className="text-sm text-gray-500">{result.timestamp}</p>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>

            {results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Click "Run Authentication Tests" to start debugging
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
