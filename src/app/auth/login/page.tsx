'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ArrowRight, Lock, Mail, Sparkles, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useWorkspace();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Fallback for hackathon testing if user doesn't exist yet: auto-register or bypass gracefully
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: email.split('@')[0], persona: 'founder' }
            }
          });
          if (signUpError) {
            setErrorMsg(error.message);
            setLoading(false);
            return;
          }
          router.push('/onboarding');
          return;
        }
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      router.push('/overview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (persona: 'founder' | 'professional') => {
    setLoading(true);
    setErrorMsg('');
    const demoEmail = persona === 'founder' ? 'test-founder@example.com' : 'test-ca@example.com';
    const demoPassword = 'Password123!';

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });

      if (error) {
        // Auto create demo account if first time
        await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: {
              full_name: persona === 'founder' ? 'Subanesh (Founder)' : 'Aditi Sharma (CA)',
              persona
            }
          }
        });
      }

      await setRole(persona);
      router.push('/overview');
    } catch {
      await setRole(persona);
      router.push('/overview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-9 h-9 rounded bg-black text-white flex items-center justify-center font-bold text-sm">
            MCA
          </div>
          <span className="text-xl font-bold tracking-tight text-black">Future MCA</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-black">
          Sign in to your account
        </h1>
        <p className="mt-1 text-xs text-[#525252]">
          Corporate government services, ready for humans and AI agents.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E5E5] rounded-xl sm:px-10 space-y-6">
          
          {errorMsg && (
            <div className="p-3 rounded bg-[#FEF2F2] border border-[#DC2626]/20 text-xs text-[#DC2626] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Test Logins */}
          <div className="pt-4 border-t border-[#E5E5E5] space-y-2.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] text-center">
              Quick Test Personas (1-Click Login)
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('founder')}
                className="p-2.5 rounded border border-[#E5E5E5] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-black">
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Test Founder</span>
                </div>
                <div className="text-[10px] text-[#737373]">Ziggers Startup</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('professional')}
                className="p-2.5 rounded border border-[#E5E5E5] hover:border-[#2563EB] hover:bg-[#EFF6FF] text-left transition-colors"
              >
                <div className="flex items-center space-x-1.5 text-xs font-bold text-black">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Test CA / CS</span>
                </div>
                <div className="text-[10px] text-[#737373]">Multi-Client Firm</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[#525252]">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#2563EB] font-medium hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
