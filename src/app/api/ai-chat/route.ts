import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/services/actionService';
import { PRIMARY_DEMO_COMPANY, PRIMARY_DEMO_DIRECTORS } from '@/lib/services/seedService';

export const runtime = 'nodejs';

async function callGemini(prompt: string, contextPrompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Future MCA Autonomous Copilot, a founder-friendly corporate copilot assisting Varun Maya (Founder & Managing Director of Aeos Labs Private Limited).
Active Company: Aeos Labs Private Limited (CIN: U62099TN2026PTCDEMO001)
Directors: Varun Maya (Managing Director), Rahul Menon (Director - Resignation Pending)

User Question / Command:
"${prompt}"

Instructions:
1. Provide helpful, conversational, clear advice without overwhelming legal jargon.
2. If the user asks about director resignation, explain that Rahul Menon's resignation on 25 August 2026 requires Form DIR-12 under Section 168.
3. If the user asks to incorporate/start a company, explain the SPICe+ Part A/B workflow step-by-step.
4. Always uphold the Zero Silent Execution principle (AI prepares and previews, human confirms and signs via DSC).`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024
        }
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context = {} } = await request.json();
    const query = (message || '').trim().toLowerCase();
    const activeCompany = context.companyName || PRIMARY_DEMO_COMPANY.name;
    const activeCin = context.cin || PRIMARY_DEMO_COMPANY.cin;

    // ----------------------------------------------------
    // WORKFLOW 2: DIRECTOR RESIGNATION (PRIMARY DEMO)
    // ----------------------------------------------------
    if (
      query.includes('resig') || 
      query.includes('director resign') || 
      query.includes('rahul') || 
      query.includes('dir-12') || 
      query.includes('remove director') ||
      query.includes('director left')
    ) {
      const preparedAction = await ActionService.prepareDirectorChange({
        company_id_or_cin: activeCin,
        change_type: 'RESIGNATION',
        director_name: 'Rahul Menon',
        din: '09124589',
        effective_date: '2026-08-25',
        reason: 'Personal reasons',
        documents: ['Rahul_Menon_Resignation_Letter.pdf']
      }, {
        workspaceId: context.workspaceId || 'ws_aeos_labs_001',
        userId: 'usr_varun_maya',
        actorType: 'AI_CLIENT',
        clientName: 'Future MCA Conversational Copilot',
        clientType: 'Anthropic Claude / In-App AI'
      });

      return NextResponse.json({
        type: 'action_prepared',
        workflow_type: 'DIRECTOR_RESIGNATION',
        action_id: preparedAction.id,
        text: `### 📋 Director Resignation Workflow Identified

I can help with that. When a director leaves a company, the official MCA registry records need to be updated.

For **Aeos Labs Private Limited**, I found the following director record:
• **Rahul Menon** — Director (DIN: 09124589) | Appointed: 15 Jan 2026

---

#### **What this means & why it's needed:**
Under **Section 168 of the Companies Act 2013**, the company must file **Form DIR-12** with ROC Chennai within **30 days** of the resignation date to officially record the cessation and avoid per-day statutory penalties.

#### **What I've prepared for you:**
✓ **Director:** Rahul Menon (DIN: 09124589)  
✓ **Effective Resignation Date:** 25 August 2026  
✓ **Identified Statutory Workflow:** Form DIR-12 (Director Cessation)  
✓ **Attached Document:** \`Rahul_Menon_Resignation_Letter.pdf\` (Available)  
✓ **Statutory Deadline:** 24 September 2026 (High Priority)  

---

⚠️ **Zero Silent Execution Policy:** This action draft has been prepared and validated, but **NOT** submitted. Please review the details before confirming.`,
        action: {
          label: 'Review Director Resignation & Authorize (DIR-12)',
          url: `/actions/${preparedAction.id}`
        },
        action_preview: preparedAction.preview,
        tools_used: ['get_company_directors', 'identify_required_filing', 'prepare_director_change']
      });
    }

    // ----------------------------------------------------
    // WORKFLOW 1: COMPANY INCORPORATION (SPICe+)
    // ----------------------------------------------------
    if (
      query.includes('start a company') || 
      query.includes('incorporat') || 
      query.includes('register a new company') || 
      query.includes('form a pvt ltd') ||
      query.includes('new venture')
    ) {
      const preparedAction = await ActionService.prepareCompanyRegistration({
        proposed_names: ['Aeos Labs Private Limited', 'Aeos Enterprise AI Private Limited'],
        company_type: 'PVT_LTD',
        registered_state: 'Tamil Nadu',
        authorized_capital: 1000000,
        paid_up_capital: 100000,
        directors: [
          { full_name: 'Varun Maya', email: 'varun@aeoslabs.in' },
          { full_name: 'Rahul Menon', email: 'rahul@aeoslabs.in' }
        ]
      }, {
        workspaceId: context.workspaceId || 'ws_aeos_labs_001',
        userId: 'usr_varun_maya',
        actorType: 'AI_CLIENT',
        clientName: 'Future MCA Conversational Copilot',
        clientType: 'Anthropic Claude / In-App AI'
      });

      return NextResponse.json({
        type: 'action_prepared',
        workflow_type: 'COMPANY_INCORPORATION',
        action_id: preparedAction.id,
        text: `### 🚀 Company Incorporation Journey (SPICe+ Suite)

Great! I'll guide you through your incorporation journey. In India, new companies are registered through the integrated **SPICe+ (INC-32)** suite under Section 7 of the Companies Act 2013.

#### **Incorporation Progress**
● **Company Details:** Aeos Labs Private Limited  
● **Business Activity:** Artificial Intelligence & Enterprise Software  
● **Directors:** Varun Maya & Rahul Menon  
● **Registered Office:** Chennai, Tamil Nadu  
● **Capital Structure:** ₹10,00,000 Authorized Capital  
○ **Documents:** PAN, Identity & Address Proofs, Registered Office Proof  
○ **Review & Authorize**  

---

#### **Required Documents Checklist:**
• **Director Identity:** PAN, Passport / Voter ID, Passport-size Photo  
• **Registered Office:** Electricity Bill (< 2 months), Lease Deed & Owner NOC  
• **Statutory Registrations Included:** PAN, TAN, EPFO, ESIC, Professional Tax & Bank Account  

⚠️ **Zero Silent Execution Policy:** I have prepared your complete incorporation draft pack. Nothing will be submitted until you review and authorize via DSC.`,
        action: {
          label: 'Review Incorporation Details & Proceed',
          url: `/actions/${preparedAction.id}`
        },
        action_preview: preparedAction.preview,
        tools_used: ['search_mca_knowledge', 'prepare_company_registration']
      });
    }

    // ----------------------------------------------------
    // LEVEL 1: COMPLIANCE & DEADLINES INQUIRY
    // ----------------------------------------------------
    if (query.includes('deadline') || query.includes('compliance') || query.includes('due date') || query.includes('pending')) {
      return NextResponse.json({
        type: 'compliance_summary',
        text: `### 📊 Compliance Status for **Aeos Labs Private Limited**\n\n- **Entity:** Aeos Labs Private Limited (\`U62099TN2026PTCDEMO001\`)\n- **Highest Priority Action:** **DIR-12 (Director Cessation - Rahul Menon)** due by **24 September 2026**.\n- **Annual Return:** Form MGT-7A scheduled for November 2026.\n- **Financial Statements:** Form AOC-4 scheduled for October 2026.\n\nWould you like me to prepare the **DIR-12** filing for Rahul Menon?`,
        tools_used: ['get_compliance_status', 'get_upcoming_deadlines']
      });
    }

    // ----------------------------------------------------
    // FALLBACK / GENERAL AI RESPONSE (GEMINI)
    // ----------------------------------------------------
    const contextPrompt = `
Company: ${activeCompany} (${activeCin})
Directors: Varun Maya (Managing Director), Rahul Menon (Director - Resignation Pending)
    `.trim();

    const aiAnswer = await callGemini(message, contextPrompt);
    if (aiAnswer) {
      return NextResponse.json({
        type: 'chat_response',
        text: aiAnswer,
        tools_used: ['search_mca_knowledge']
      });
    }

    return NextResponse.json({
      type: 'chat_response',
      text: `I'm here to help manage corporate actions and compliance for **Aeos Labs Private Limited**.\n\nYou can ask me to:\n- **"My director resigned"** &rarr; Prepare Form DIR-12 for Rahul Menon\n- **"I want to start a company"** &rarr; Launch SPICe+ Incorporation Journey\n- **"What are my upcoming deadlines?"** &rarr; View compliance cutoffs and penalty exposure`,
      tools_used: ['get_company_profile']
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
