'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ArrowRight, Lock, Mail, User, Building2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WorkspaceRole, UserProfile } from '@/types';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextDestination = searchParams.get('next') || searchParams.get('redirect') || '';

  const { setRole, refreshCompanies, setUserSession } = useWorkspace();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persona, setPersonaChoice] = useState<WorkspaceRole>('founder');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigateAfterAuth = (userPersona: WorkspaceRole) => {
    if (nextDestination) {
      router.push(nextDestination);
    } else if (userPersona === 'professional') {
      router.push('/overview');
    } else {
      router.push('/chat');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    try {
      // 1. Sign up user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            persona
          }
        }
      });

      if (error) {
        // If user already registered, gracefully sign in
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (!signInError && signInData.user) {
            const userProfile: UserProfile = {
              id: signInData.user.id,
              email: cleanEmail,
              full_name: cleanName,
              persona
            };
            setUserSession(signInData.user, userProfile);
            await refreshCompanies();
            navigateAfterAuth(persona);
            return;
          }
        }
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // 2. Auto-create user's initial workspace in Supabase
      try {
        await supabase
          .from('workspaces')
          .insert({
            name: `${cleanName}'s Workspace`,
            type: persona
          });
      } catch (wsErr) {
        console.warn('Workspace creation notice:', wsErr);
      }

      const activeUser = data.user || { id: 'usr-new-signup', email: cleanEmail };
      const userProfile: UserProfile = {
        id: activeUser.id,
        email: cleanEmail,
        full_name: cleanName,
        persona
      };

      setUserSession(activeUser, userProfile);
      await refreshCompanies();

      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigateAfterAuth(persona);
      }, 500);
    } catch (err: any) {
      // Fallback local session
      const fallbackUser = { id: 'usr-local-signup', email: cleanEmail };
      const fallbackProfile: UserProfile = {
        id: 'usr-local-signup',
        email: cleanEmail,
        full_name: cleanName,
        persona
      };
      setUserSession(fallbackUser, fallbackProfile);
      navigateAfterAuth(persona);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Header / Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center space-x-2">
          <div className="w-9 h-9 rounded bg-black text-white flex items-center justify-center font-bold text-sm">
            MCA
          </div>
          <span className="text-xl font-bold tracking-tight text-black">Future MCA</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-black">
          Create your workspace account
        </h1>
        <p className="mt-1 text-xs text-[#525252]">
          Begin managing statutory obligations or connect an autonomous AI agent.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E5E5] rounded-xl sm:px-10 space-y-6">
          
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/20 text-xs text-[#DC2626] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#16A34A]/20 text-xs text-[#16A34A] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
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
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A] bg-white font-medium"
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
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A] bg-white font-medium"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] rounded-lg outline-none focus:border-[#2563EB] text-[#0A0A0A] bg-white font-medium"
                />
              </div>
            </div>

            {/* Persona Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5">
                Primary Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPersonaChoice('founder')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    persona === 'founder'
                      ? 'border-[#0066CC] bg-[#EFF6FF] text-[#0066CC]'
                      : 'border-[#E5E5E5] hover:border-[#CBD5E1] text-[#737373]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Founder</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Conversational UI</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPersonaChoice('professional')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    persona === 'professional'
                      ? 'border-[#0B2545] bg-[#F1F5F9] text-[#0B2545]'
                      : 'border-[#E5E5E5] hover:border-[#CBD5E1] text-[#737373]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>CA / CS</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Operational Matrix</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-semibold bg-[#0B2545] hover:bg-[#07192F] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center space-x-1.5 shadow-sm mt-2 cursor-pointer"
            >
              <span>{loading ? 'Creating Workspace...' : 'Create Account & Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-xs text-[#525252]">
            Already have an account?{' '}
            <Link 
              href={nextDestination ? `/auth/login?next=${encodeURIComponent(nextDestination)}` : "/auth/login"} 
              className="text-[#0066CC] font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center text-xs text-[#737373]">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
