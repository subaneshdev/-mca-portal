import type { Metadata } from 'next';
import './globals.css';
import { WorkspaceProvider } from '@/context/WorkspaceContext';

export const metadata: Metadata = {
  title: 'Future MCA | Government services, ready for humans and AI agents',
  description: 'AI-native redesign of the Ministry of Corporate Affairs experience. Manage companies, understand compliance, and connect your authorized MCA workspace directly to AI agents via MCP.',
  keywords: ['MCA', 'Ministry of Corporate Affairs', 'Companies Act 2013', 'AOC-4', 'MGT-7', 'DIR-12', 'Model Context Protocol', 'MCP Server', 'Indian Corporate Compliance'],
  authors: [{ name: 'Future MCA Initiative' }],
  openGraph: {
    title: 'Future MCA - Reimagining Ministry of Corporate Affairs',
    description: 'AI-native corporate government services for Founders, CAs, Company Secretaries, and AI Agents.',
    type: 'website',
    url: 'https://futuremca.in'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'GovernmentService',
              name: 'Future MCA',
              serviceType: 'Corporate Compliance & Agentic Government Filing',
              provider: {
                '@type': 'Organization',
                name: 'Ministry of Corporate Affairs Digital Modernization'
              },
              description: 'AI-native platform providing intent-based corporate workflows and remote Model Context Protocol tools for AI agents.'
            })
          }}
        />
      </head>
      <body className="bg-white text-[#0A0A0A] antialiased selection:bg-[#2563EB] selection:text-white">
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
      </body>
    </html>
  );
}
