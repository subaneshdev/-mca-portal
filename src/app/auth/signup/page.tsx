'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ArrowRight, Lock, Mail, User, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import { WorkspaceRole } from '@/types';

export default function SignUpPage() {
  const router = useRouter();
  const { setRole } = useWorkspace();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersonaChoice] = useState<WorkspaceRole>('founder');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            persona
          }
        }
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      await setRole(persona);
      router.push('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign up failed.');
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
          Create your account
        </h1>
        <p className="mt-1 text-xs text-[#525252]">
          Begin managing statutory obligations or connect an autonomous AI agent.
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

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Subanesh M."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A]"
                />
              </div>
            </div>

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
                  placeholder="founder@venture.io"
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
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A]"
                />
              </div>
            </div>

            {/* Persona Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-[#0A0A0A]">
                How will you use Future MCA?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPersonaChoice('founder')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    persona === 'founder'
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E5E5E5] hover:bg-[#F7F7F5] text-[#525252]'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1" />
                  <div className="font-bold text-xs text-black">Business Owner</div>
                  <div className="text-[10px] text-[#737373]">Manage your company</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPersonaChoice('professional')}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    persona === 'professional'
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E5E5E5] hover:bg-[#F7F7F5] text-[#525252]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-1" />
                  <div className="font-bold text-xs text-black">CA / CS Practice</div>
                  <div className="text-[10px] text-[#737373]">Manage client portfolio</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center space-x-1.5 pt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Continue to Onboarding'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-xs text-[#525252] pt-2 border-t border-[#E5E5E5]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#2563EB] font-medium hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
