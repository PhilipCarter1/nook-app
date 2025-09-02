'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugTenantLogin() {
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('tenant@nook.com');
  const [password, setPassword] = useState('Test123!');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async () => {
    setLogs([]);
    addLog('🚀 Starting tenant login test...');
    
    try {
      const supabase = createClient();
      addLog('✅ Supabase client created');
      
      // Test 1: Check if user exists in auth.users
      addLog('🔍 Checking auth.users...');
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email);
      
      if (authError) {
        addLog(`❌ Auth users query error: ${authError.message}`);
      } else {
        addLog(`✅ Found ${authUsers?.length || 0} users in auth.users`);
        if (authUsers && authUsers.length > 0) {
          addLog(`📧 Email: ${authUsers[0].email}`);
          addLog(`🆔 ID: ${authUsers[0].id}`);
          addLog(`📅 Created: ${authUsers[0].created_at}`);
        }
      }

      // Test 2: Check if user exists in public.users
      addLog('🔍 Checking public.users...');
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      
      if (publicError) {
        addLog(`❌ Public users query error: ${publicError.message}`);
      } else {
        addLog(`✅ Found ${publicUsers?.length || 0} users in public.users`);
        if (publicUsers && publicUsers.length > 0) {
          addLog(`📧 Email: ${publicUsers[0].email}`);
          addLog(`🆔 ID: ${publicUsers[0].id}`);
          addLog(`👤 Name: ${publicUsers[0].name}`);
          addLog(`🎭 Role: ${publicUsers[0].role}`);
        }
      }

      // Test 3: Try to sign in
      addLog('🔐 Attempting sign in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        addLog(`❌ Sign in error: ${signInError.message}`);
      } else {
        addLog(`✅ Sign in successful!`);
        addLog(`🆔 User ID: ${signInData.user?.id}`);
        addLog(`📧 Email: ${signInData.user?.email}`);
        
        // Test 4: Check session
        addLog('🔍 Checking session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addLog(`❌ Session error: ${sessionError.message}`);
        } else {
          addLog(`✅ Session found: ${sessionData.session ? 'Yes' : 'No'}`);
          if (sessionData.session) {
            addLog(`🆔 Session user ID: ${sessionData.session.user.id}`);
          }
        }
      }

    } catch (error) {
      addLog(`💥 Unexpected error: ${error}`);
    }
  };

  const createUserInPublic = async () => {
    addLog('🔧 Creating user in public.users...');
    
    try {
      const supabase = createClient();
      
      // Get the auth user first
      const { data: authUsers } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!authUsers) {
        addLog('❌ No auth user found');
        return;
      }
      
      addLog(`🆔 Auth user ID: ${authUsers.id}`);
      
      // Create user in public.users
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: authUsers.id,
            email: authUsers.email,
            first_name: authUsers.email?.split('@')[0] || 'User',
            last_name: '',
            name: authUsers.email?.split('@')[0] || 'User',
            role: 'tenant',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (createError) {
        addLog(`❌ Create user error: ${createError.message}`);
      } else {
        addLog(`✅ User created successfully!`);
        addLog(`🆔 New user ID: ${newUser.id}`);
        addLog(`👤 Name: ${newUser.name}`);
        addLog(`🎭 Role: ${newUser.role}`);
      }
      
    } catch (error) {
      addLog(`💥 Create user error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Tenant Login</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={testLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Login Flow
              </button>
              <button
                onClick={createUserInPublic}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create User in Public
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Test Login Flow" to start.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
