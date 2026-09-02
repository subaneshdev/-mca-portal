import { executeMcpTool } from '../src/lib/mcp/tools';
import { PRIMARY_DEMO_COMPANY, PRIMARY_DEMO_DIRECTORS } from '../src/lib/services/seedService';

async function runHackathonVerification() {
  console.log('==================================================');
  console.log('TEST 1: MCP WORKFLOW ONE — START A COMPANY');
  console.log('==================================================');

  // Step 1: start_company_incorporation
  const incInit = await executeMcpTool('start_company_incorporation', {});
  console.log('1. start_company_incorporation:', incInit);
  if (incInit.next_step !== 'COMPANY_NAME') throw new Error('Failed start_company_incorporation');

  // Step 2: check_company_name_availability
  const nameCheck = await executeMcpTool('check_company_name_availability', {
    company_name: 'Aether Labs Private Limited'
  });
  console.log('2. check_company_name_availability:', nameCheck);
  if (!nameCheck.available) throw new Error('Failed name availability');

  // Step 3: collect_company_details
  const details = await executeMcpTool('collect_company_details', {
    company_name: 'Aether Labs Private Limited',
    company_type: 'Private Limited Company',
    business_activity: 'AI Infrastructure and Enterprise Automation',
    registered_office: 'Chennai, Tamil Nadu, India',
    authorized_capital: '₹10,00,000'
  });
  console.log('3. collect_company_details:', details);

  // Step 4: add_company_director
  const dir1 = await executeMcpTool('add_company_director', {
    company_name: 'Aether Labs Private Limited',
    director_name: 'Varun Maya',
    designation: 'Director',
    status: 'Active'
  });
  const dir2 = await executeMcpTool('add_company_director', {
    company_name: 'Aether Labs Private Limited',
    director_name: 'Arun Kumar',
    designation: 'Director',
    status: 'Active'
  });
  console.log('4. add_company_director:', dir1.director, dir2.director);

  // Step 5: create_company
  const created = await executeMcpTool('create_company', {
    company_name: 'Aether Labs Private Limited',
    company_type: 'Private Limited Company',
    business_activity: 'AI Infrastructure and Enterprise Automation',
    registered_office: 'Chennai, Tamil Nadu, India',
    authorized_capital: '₹10,00,000',
    directors: [
      { full_name: 'Varun Maya', designation: 'Director', status: 'Active' },
      { full_name: 'Arun Kumar', designation: 'Director', status: 'Active' }
    ]
  });
  console.log('5. create_company result:', created);
  if (created.status !== 'CREATED') throw new Error('Failed create_company');

  // Verify Read Tools before resignation
  const preDirs = await executeMcpTool('get_company_directors', { cin: 'U62099TN2026PTC145678' });
  console.log('\nInitial get_company_directors:');
  console.log('Active Directors:', preDirs.active_directors);
  console.log('Former Directors:', preDirs.former_directors);
  if (preDirs.active_directors.length !== 2) throw new Error('Expected 2 active directors');

  console.log('\n==================================================');
  console.log('TEST 2: MCP WORKFLOW TWO — MY DIRECTOR RESIGNED');
  console.log('==================================================');

  // Step 1: identify_required_filing
  const filingCheck = await executeMcpTool('identify_required_filing', {
    event_description: 'director resigned'
  });
  console.log('1. identify_required_filing:', filingCheck.recommended_form);
  if (filingCheck.recommended_form !== 'DIR-12') throw new Error('Expected DIR-12');

  // Step 2: prepare_director_resignation
  const prepRes = await executeMcpTool('prepare_director_resignation', {
    director_name: 'Arun Kumar',
    effective_date: '15 August 2026'
  });
  console.log('2. prepare_director_resignation:', prepRes);

  // Step 3: process_director_resignation
  const procRes = await executeMcpTool('process_director_resignation', {
    director_name: 'Arun Kumar',
    effective_date: '15 August 2026'
  });
  console.log('3. process_director_resignation:', procRes);
  if (procRes.status !== 'SUCCESS') throw new Error('Expected SUCCESS');

  console.log('\n==================================================');
  console.log('TEST 3: PROVE DATABASE ACTUALLY CHANGED (READ TOOLS)');
  console.log('==================================================');

  // Read Tool 1: get_company_directors
  const postDirs = await executeMcpTool('get_company_directors', { cin: 'U62099TN2026PTC145678' });
  console.log('1. get_company_directors:');
  console.log('Active Directors:', postDirs.active_directors);
  console.log('Former Directors:', postDirs.former_directors);
  if (postDirs.active_directors.length !== 1 || postDirs.active_directors[0].name !== 'Varun Maya') {
    throw new Error('Expected Varun Maya as sole active director');
  }
  if (postDirs.former_directors.length !== 1 || postDirs.former_directors[0].name !== 'Arun Kumar') {
    throw new Error('Expected Arun Kumar as former director');
  }

  // Read Tool 2: get_company_profile
  const profile = await executeMcpTool('get_company_profile', { cin: 'U62099TN2026PTC145678' });
  console.log('\n2. get_company_profile:', profile.company);
  if (profile.company.name !== 'Aether Labs Private Limited') throw new Error('Company name mismatch');

  // Read Tool 3: get_compliance_status
  const compliance = await executeMcpTool('get_compliance_status', { cin: 'U62099TN2026PTC145678' });
  console.log('\n3. get_compliance_status (deadlines count):', compliance.deadlines.length);
  const dir12Filing = compliance.deadlines.find((d: any) => d.form_code === 'DIR-12');
  console.log('Found DIR-12 filing in deadlines:', dir12Filing?.title);
  if (!dir12Filing) throw new Error('Expected DIR-12 in compliance deadlines');

  console.log('\n✅ ALL MCP TEST WORKFLOWS PASSED WITH 100% SUCCESS!\n');
}

runHackathonVerification().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
