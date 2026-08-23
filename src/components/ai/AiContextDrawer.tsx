'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Sparkles, X, Send, ArrowRight, Bot, User, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  action?: {
    label: string;
    url: string;
  };
  tools_used?: string[];
  timestamp: string;
}

export function AiContextDrawer() {
  const { isAiDrawerOpen, setIsAiDrawerOpen, selectedCompany, aiInitialQuery } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello. I am your **Future MCA Context Agent**.\n\n${
        selectedCompany 
          ? `I have active authorization for **${selectedCompany.name}** (\`${selectedCompany.cin}\`).` 
          : 'Ready to assist with Indian corporate law, MCA V3 filings, and compliance rules.'
      }\n\nHow can I help you today?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiInitialQuery) {
      handleSendMessage(aiInitialQuery);
    }
  }, [aiInitialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            cin: selectedCompany?.cin || '',
            company_name: selectedCompany?.name || 'Authorized Workspace Entity'
          }
        })
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || 'I analyzed your request using MCA compliance rules.',
        action: data.action,
        tools_used: data.tools_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Unable to communicate with the MCA service layer. Please retry.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'What compliance is due this month?',
    'A director resigned',
    'Why did my DSC verification fail?',
    'What happens if AOC-4 is delayed?'
  ];

  if (!isAiDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white border-l border-[#E5E5E5] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] bg-[#F7F7F5]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#2563EB] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0A0A0A] flex items-center space-x-1.5">
              <span>MCA AI Assistant</span>
              <span className="text-[10px] font-mono px-1 rounded bg-white text-[#2563EB] border border-[#E5E5E5]">
                MCP Live
              </span>
            </div>
            <div className="text-[10px] text-[#737373] truncate max-w-[240px]">
              Scope: {selectedCompany?.name || 'General Guidance'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1 text-[#737373] hover:text-black hover:bg-white rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3.5 ${
                msg.sender === 'user'
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-[#F7F7F5] border border-[#E5E5E5] text-[#0A0A0A]'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>

              {/* Tools executed indicator */}
              {msg.tools_used && msg.tools_used.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#E5E5E5] flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#737373] flex items-center space-x-1">
                    <Cpu className="w-2.5 h-2.5" />
                    <span>Tools:</span>
                  </span>
                  {msg.tools_used.map(tool => (
                    <span key={tool} className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E5E5E5] text-[#2563EB]">
                      {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              {msg.action && (
                <div className="mt-3 pt-2">
                  <Link
                    href={msg.action.url}
                    onClick={() => setIsAiDrawerOpen(false)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium transition-colors"
                  >
                    <span>{msg.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            <span className="text-[10px] text-[#737373] mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-[#737373] text-xs p-2 bg-[#F7F7F5] rounded border border-[#E5E5E5] w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
            <span>Consulting MCA rules & active company data...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested contextual chips */}
      <div className="p-3 border-t border-[#E5E5E5] bg-[#F7F7F5]">
        <div className="text-[10px] text-[#737373] uppercase tracking-wider font-medium mb-2">
          Suggested Intent Actions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] text-[#0A0A0A] bg-white hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#E5E5E5] hover:border-[#2563EB] px-2.5 py-1 rounded transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#E5E5E5] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything about compliance, errors, or forms..."
            className="flex-1 px-3 py-2 text-xs border border-[#E5E5E5] rounded focus:outline-none focus:border-[#2563EB] text-[#0A0A0A]"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white rounded transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
