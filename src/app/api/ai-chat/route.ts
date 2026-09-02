import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/services/actionService';
import { CompanyService } from '@/lib/services/companyService';
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
4. Direct Director Addition: If the user asks to add a person as a director ("add X as director"), DO NOT demand DSC authorization. Create an 8-digit DIN, ask confirmation, and directly add them to the company without requiring DSC.`
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
    // CONVERSATIONAL CONFIRMATION HANDLER
    // ----------------------------------------------------
    if (
      query === 'confirm' ||
      query === 'yes' ||
      query === 'proceed' ||
      query === 'approve' ||
      query === 'directly add' ||
      query === 'confirm add' ||
      query.startsWith('confirm add') ||
      query.includes('directly add them') ||
      query === 'confirm and directly add'
    ) {
      const pendingAction = await ActionService.getLatestPendingAction(activeCin);
      if (pendingAction && pendingAction.status === 'AWAITING_USER_CONFIRMATION') {
        if (pendingAction.action_type === 'DIRECTOR_CHANGE' && pendingAction.payload?.change_type === 'APPOINTMENT') {
          // Confirm action
          await ActionService.confirmAction(pendingAction.id, pendingAction.confirmation_token || undefined, {
            workspaceId: context.workspaceId,
            userId: 'usr_varun_maya',
            actorType: 'USER',
            clientName: 'Future MCA Conversational Copilot'
          });

          // Directly execute (no DSC needed)
          const execResult = await ActionService.executeAction(pendingAction.id, undefined, {
            workspaceId: context.workspaceId,
            userId: 'usr_varun_maya',
            actorType: 'USER',
            clientName: 'Future MCA Conversational Copilot'
          });

          const updatedDirectors = await CompanyService.getCompanyDirectors(activeCin);
          const candidateName = pendingAction.payload?.director_name || 'New Director';
          const din = pendingAction.payload?.din || '09847219';

          return NextResponse.json({
            type: 'action_executed',
            workflow_type: 'DIRECTOR_APPOINTMENT',
            action_id: pendingAction.id,
            text: `### ✅ Director Successfully Added!

**${candidateName}** (DIN: **${din}**) has been directly added to the Board of Directors of **${activeCompany}**.

- **Official Reference SRN:** \`${execResult.reference_number}\`
- **Filing:** Form DIR-12 recorded with RoC
- **DSC Authorization:** ⚡ **Bypassed — No DSC authorization required**
- **Status:** **ACTIVE**

---

#### 🏛️ Current Board of Directors:
${updatedDirectors.map((d, i) => `${i + 1}. **${d.full_name}** — ${d.designation} (DIN: \`${d.din}\`) | Status: ${d.din_status || 'APPROVED'}`).join('\n')}

All company records and compliance tracking have been updated immediately.`,
            tools_used: ['confirm_action', 'execute_action', 'add_director', 'get_company_directors']
          });
        }
      }
    }

    // ----------------------------------------------------
    // WORKFLOW 3: DIRECT DIRECTOR ADDITION (DIN + DIRECT ADD)
    // ----------------------------------------------------
    const isAddDirectorIntent =
      (query.includes('add') && (query.includes('director') || query.includes('person') || query.includes('din'))) ||
      query.includes('appoint') ||
      query.includes('new director') ||
      query.includes('create din');

    if (isAddDirectorIntent && !query.includes('resig') && !query.includes('remove director')) {
      // Extract candidate name
      let candidateName = 'X Person';
      const rawMatch = 
        message.match(/add\s+(.+?)\s+as\s+(?:an?\s+)?director/i) ||
        message.match(/appoint\s+(.+?)\s+as\s+(?:an?\s+)?director/i) ||
        message.match(/add\s+director\s+([A-Za-z\s]+)/i);

      if (rawMatch && rawMatch[1]) {
        candidateName = rawMatch[1]
          .replace(/\b(create din|din number|ask confirmation|confirmation|and directly add|directly add|as an? director|to board|to company)\b.*/i, '')
          .trim();
        candidateName = candidateName.replace(/^['"]|['"]$/g, '').trim();
        if (candidateName.length > 1) {
          candidateName = candidateName
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        } else {
          candidateName = 'X Person';
        }
      }

      const generatedDin = `09${Math.floor(100000 + Math.random() * 900000)}`;

      const preparedAction = await ActionService.prepareDirectorChange({
        company_id_or_cin: activeCin,
        change_type: 'APPOINTMENT',
        director_name: candidateName,
        din: generatedDin,
        effective_date: new Date().toISOString().split('T')[0],
        reason: 'Strategic board expansion & appointment'
      }, {
        workspaceId: context.workspaceId || 'ws_aeos_labs_001',
        userId: 'usr_varun_maya',
        actorType: 'AI_CLIENT',
        clientName: 'Future MCA Conversational Copilot',
        clientType: 'Anthropic Claude / In-App AI'
      });

      return NextResponse.json({
        type: 'action_prepared',
        workflow_type: 'DIRECTOR_APPOINTMENT',
        action_id: preparedAction.id,
        text: `### 📋 Director Appointment Draft Prepared

I have generated a new Director Identification Number (DIN) and prepared the appointment draft for **${activeCompany}**.

- **Director Candidate:** **${candidateName}**
- **Allocated DIN:** **${generatedDin}** (Status: Allocated / Pre-approved)
- **Designation:** Director
- **Filing e-Form:** Form DIR-12 (Appointment of Director)
- **DSC Authorization:** ⚡ **Not Required (Direct Addition Mode)**

---

#### ❓ **Confirmation Required**
Would you like me to directly add **${candidateName}** (DIN: **${generatedDin}**) to the Board of Directors?

👉 **Reply "Confirm"** or click the button below to directly add them to the company registry.`,
        action: {
          label: `Confirm & Directly Add ${candidateName} (DIN: ${generatedDin})`,
          url: `/actions/${preparedAction.id}`
        },
        action_preview: preparedAction.preview,
        tools_used: ['generate_din', 'prepare_director_change']
      });
    }

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
