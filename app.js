(() => {
  'use strict';

  const DATA = window.BENEFITS_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n || 0));
  const num = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const yn = (v) => v === true || v === 'yes' || v === 'true';
  const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  const benefitMeta = [
    { id:'uc', icon:'UC', title:'Universal Credit', tags:['Living costs','Low income','Housing'], desc:'Monthly support for people on a low income, out of work or unable to work. Education and savings rules matter.' },
    { id:'pip', icon:'PIP', title:'Personal Independence Payment', tags:['Disability','Daily living','Mobility'], desc:'Support for extra costs when a long-term condition or disability affects everyday activities or getting around.' },
    { id:'carers', icon:'CA', title:"Carer's Allowance", tags:['Caring','35+ hours'], desc:'For some people who provide regular care to someone receiving a qualifying disability benefit.' },
    { id:'esa', icon:'ESA', title:'New Style ESA', tags:['Health','National Insurance'], desc:'Contribution-based support if a health condition or disability limits ability to work and National Insurance conditions are met.' },
    { id:'housing', icon:'HB', title:'Housing Benefit', tags:['Supported housing','Temporary housing'], desc:'Most working-age new claims have moved to Universal Credit, but Housing Benefit still applies in some accommodation.' },
    { id:'council', icon:'CT', title:'Council Tax Reduction', tags:['Local council','Low income'], desc:'A council-run reduction for people on a low income or benefits. The exact scheme depends on where you live.' },
    { id:'atw', icon:'AW', title:'Access to Work', tags:['Employment','Disability'], desc:'Practical support or a grant to help disabled people start or stay in paid work.' },
    { id:'attendance', icon:'AA', title:'Attendance Allowance', tags:['Later life','Care needs'], desc:'Later-life disability support for people who have reached State Pension age. Included for future awareness.' }
  ];

  const defaultState = {
    uc: { step:0, name:'Alex Green', age:18, relationship:'single', partnerAge:18, education:'full-nonadvanced', afterSep19:'no', noStudentFinance:'yes', availableForWork:'no', pipDaily:'yes', wcaBeforeCourse:'yes', noParentalSupport:'no', responsibleChild:'no', healthFitNote:'yes', caresForDisabled:'no', earnings:0, partnerEarnings:0, savings:250, children:0, firstChildPre2017:'no', carerEligible:'no', lcwra:'none', home:'parents', legalRent:'no', rent:0, lhaArea:'leeds', lhaCategory:'shared', manualLha:0, nonDeps:0, spareRooms:'0', ni:'TR 00 00 00 A', bank:'training', comms:'easyread', confirmTraining:true },
    pip: { step:0, age:18, reachedPensionAge:'no', hadDifficulties3Months:'yes', expected9Months:'yes', scores:{} },
    carers: {}, esa:{}, housing:{}, council:{}, atw:{}, attendance:{}
  };

  // Training answers deliberately live in memory only. Nothing entered into the
  // simulator is written to localStorage, sessionStorage, Firestore or any other
  // database. Refreshing or closing the page resets the practice session.
  let state = structuredCloneSafe(defaultState);
  let deferredInstallPrompt = null;

  function structuredCloneSafe(o){ return JSON.parse(JSON.stringify(o)); }
  function saveState(){ /* Intentionally not persisted. */ }

  function nav(view){
    $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === view || (['uc','pip','carers','esa','housing','council','atw','attendance'].includes(view) && b.dataset.nav === 'applications')));
    const main = $('#main');
    if (main) main.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'smooth'});
    if (view === 'uc') renderUc();
    if (view === 'pip') renderPip();
    if (view === 'carers') renderCarers();
    if (view === 'esa') renderEsa();
    if (view === 'housing') renderHousing();
    if (view === 'council') renderCouncil();
    if (view === 'atw') renderAtw();
    if (view === 'attendance') renderAttendance();
  }

  function benefitCard(b, home=false){
    return `<article class="benefit-card">
      <div class="benefit-icon">${esc(b.icon)}</div>
      <h3>${esc(b.title)}</h3>
      <div class="tag-row">${b.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
      <p>${esc(b.desc)}</p>
      <button class="${home?'text-button':'secondary-button'}" data-open="${b.id}">${home?'Open practice form':'Start practice'}</button>
    </article>`;
  }

  function renderStatic(){
    $('#homeBenefitGrid').innerHTML = benefitMeta.slice(0,7).map(b=>benefitCard(b,true)).join('');
    $('#applicationGrid').innerHTML = benefitMeta.map(b=>benefitCard(b,false)).join('');

    const today = new Date();
    const validFrom = new Date(`${DATA.validFrom}T00:00:00`);
    const validTo = new Date(`${DATA.validTo}T23:59:59`);
    const current = today >= validFrom && today <= validTo;

    // The home screen is date-aware. Once the configured rates expire, it shows
    // "Update required" rather than pretending old rates belong to a newer year.
    $('#rateYearHome').textContent = current ? DATA.rateYear : 'Update required';
    $('#rateStatusHome').textContent = current ? 'Current training rates' : `Configured rates expired ${formatDate(DATA.validTo)}`;
    $('#aboutRateYear').textContent = current ? DATA.rateYear : `${DATA.rateYear} (update required)`;
    $('#aboutValidFrom').textContent = formatDate(DATA.validFrom);
    $('#aboutValidTo').textContent = formatDate(DATA.validTo);
    $('#aboutReviewed').textContent = formatDate(DATA.lastReviewed);
    $('#footerYear').textContent = `· ${today.getFullYear()}`;

    $('#rateWarning').className = `info-callout ${current?'success':'danger'}`;
    $('#rateWarning').innerHTML = `<div class="callout-icon">${current?'✓':'!'}</div><div><strong>${current?'Rates are within the configured date range.':'Benefit rates need updating before calculator use.'}</strong><p>${current?`The app is using ${esc(DATA.rateYear)} training rates. They remain configured until ${formatDate(DATA.validTo)}.`:`The app will not label the old ${esc(DATA.rateYear)} figures as current. Update benefits-data.js from official sources, then redeploy the site.`}</p></div>`;
    $('#sourceList').innerHTML = DATA.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener"><span>${esc(s.label)}</span></a>`).join('');
  }
  function formatDate(s){ return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${s}T12:00:00`)); }

  function statusCard(title, status, message, id){
    const label = status === 'likely' ? 'Likely relevant' : status === 'unlikely' ? 'Less likely / check rules' : 'May be relevant';
    return `<article class="result-card ${status}"><span class="status">${label}</span><h3>${esc(title)}</h3><p>${esc(message)}</p><div class="result-actions"><button class="secondary-button" data-open="${id}">Practise this application</button></div></article>`;
  }

  function runFinder(e){
    e.preventDefault();
    const age = num($('#finderAge').value,18);
    const home = $('#finderHome').value;
    const edu = $('#finderEducation').value;
    const work = $('#finderWork').value;
    const disability = $('#finderDisability').checked;
    const daily = $('#finderDaily').checked;
    const mobility = $('#finderMobility').checked;
    const carer = $('#finderCarer').checked;
    const child = $('#finderChild').checked;
    const noParents = $('#finderNoParents').checked;
    const out = [];

    let ucStatus = age >= 18 ? 'likely' : ((age >=16 && (disability || carer || child || noParents)) ? 'maybe':'unlikely');
    let ucMsg = age < 18 ? 'People aged 16 or 17 need to fit an exception.' : 'Low income or being out of work can make Universal Credit relevant.';
    if (edu === 'full') { ucStatus = ucStatus === 'unlikely' ? 'unlikely' : 'maybe'; ucMsg = 'Full-time education has extra Universal Credit rules. Disabled learners and some other groups can qualify, but the details matter.'; }
    out.push(statusCard('Universal Credit', ucStatus, ucMsg, 'uc'));

    if (disability && (daily || mobility)) out.push(statusCard('Personal Independence Payment', 'maybe', 'PIP may be relevant where a long-term condition affects daily living or mobility. It is not based on income or savings.', 'pip'));
    else if (disability) out.push(statusCard('Personal Independence Payment', 'maybe', 'PIP looks at how a condition affects specific activities, not just the diagnosis.', 'pip'));

    if (carer) out.push(statusCard("Carer's Allowance", edu === 'full' ? 'unlikely' : 'maybe', edu === 'full' ? 'Full-time education can prevent Carer’s Allowance, even if you provide a lot of care.' : 'You normally need to provide at least 35 hours of care and the person you care for must get a qualifying benefit.', 'carers'));

    if (disability && work !== 'paid') out.push(statusCard('New Style ESA', 'maybe', 'This can be relevant if health limits work, but it normally depends on your National Insurance contribution record.', 'esa'));
    if (home === 'supported') out.push(statusCard('Housing Benefit', 'maybe', 'New working-age Housing Benefit claims are mainly for temporary or specified supported accommodation.', 'housing'));
    if (home === 'rent' || home === 'owner') out.push(statusCard('Council Tax Reduction', 'maybe', 'If you are liable for Council Tax and have a low income, your council may reduce the bill.', 'council'));
    if (disability && work === 'paid') out.push(statusCard('Access to Work', 'likely', 'Paid workers with a disability or health condition may be able to get practical workplace support.', 'atw'));

    $('#finderResults').innerHTML = out.join('') || `<div class="info-callout"><div class="callout-icon">i</div><div><strong>No clear match from these answers.</strong><p>Try a practice application to learn about the rules in more detail.</p></div></div>`;
  }

  function selected(value, expected){ return String(value) === String(expected) ? 'selected' : ''; }
  function checked(value){ return yn(value) ? 'checked' : ''; }
  function radio(name, value, current, label){ return `<label class="choice"><input type="radio" name="${name}" value="${value}" ${String(current)===String(value)?'checked':''}><span>${label}</span></label>`; }

  function appHeader(title, subtitle, step, total){
    const pct = Math.round(((step+1)/total)*100);
    return `<div class="application-header"><div><span class="app-badge">Training application</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><button class="secondary-button" data-nav="applications">Exit application</button></div>
      <div class="application-body"><div class="application-main"><div class="progress-wrap"><div class="progress-label"><span>Step ${step+1} of ${total}</span><span>${pct}%</span></div><div class="progress-bar"><span style="width:${pct}%"></span></div></div>`;
  }
  function appSide(title, html){ return `</div><aside class="application-side"><div class="side-section"><h3>${esc(title)}</h3>${html}</div><div class="side-section"><h3>Training reminder</h3><p>Use fictional details only. A real decision can be different because DWP or a council checks evidence and the full rules.</p></div></aside></div>`; }
  function actions(step,total,backLabel='Back',nextLabel='Continue'){
    return `<div class="step-actions"><button class="secondary-button" data-step-action="back" ${step===0?'disabled':''}>${backLabel}</button><button class="primary-button" data-step-action="next">${step===total-1?'Finish':nextLabel}</button></div>`;
  }

  // UNIVERSAL CREDIT
  function renderUc(){
    const d = state.uc; const total=5; const step=Math.max(0,Math.min(total-1,num(d.step)));
    let html = `<div class="application-shell">${appHeader('Universal Credit practice','Work through a realistic training journey and calculate an indicative monthly amount.',step,total)}`;
    if (step===0){
      html += `<h2 class="step-title">About you and education</h2><p class="step-intro">These questions help decide whether the basic Universal Credit rules and student rules may apply.</p>
      <div class="form-grid two">
        <label class="field"><span>Fictional name</span><input id="ucName" value="${esc(d.name)}" autocomplete="off"><small>Do not use a real learner's full name.</small></label>
        <label class="field"><span>Age</span><input id="ucAge" type="number" min="16" max="80" value="${num(d.age,18)}"></label>
        <label class="field"><span>Relationship status</span><select id="ucRelationship"><option value="single" ${selected(d.relationship,'single')}>Single</option><option value="couple" ${selected(d.relationship,'couple')}>Living with a partner</option></select></label>
        <label class="field"><span>Partner's age (if applicable)</span><input id="ucPartnerAge" type="number" min="16" max="80" value="${num(d.partnerAge,18)}"></label>
        <label class="field"><span>Education</span><select id="ucEducation"><option value="none" ${selected(d.education,'none')}>Not in full-time education</option><option value="part" ${selected(d.education,'part')}>Part-time education</option><option value="full-nonadvanced" ${selected(d.education,'full-nonadvanced')}>Full-time non-advanced education (for example Level 1–3)</option><option value="full-advanced" ${selected(d.education,'full-advanced')}>Full-time advanced / higher education</option></select></label>
        <label class="field"><span>Are you past 1 September following your 19th birthday?</span><select id="ucAfterSep19"><option value="no" ${selected(d.afterSep19,'no')}>No</option><option value="yes" ${selected(d.afterSep19,'yes')}>Yes</option></select></label>
      </div>
      <fieldset class="question-box"><legend>Student exceptions and support</legend>
        ${radio('ucPipDaily','yes',d.pipDaily,'I get PIP daily living (or another qualifying disability benefit).')}
        ${radio('ucPipDaily','no',d.pipDaily,'I do not get a qualifying disability benefit.')}
        <hr>
        ${radio('ucWcaBeforeCourse','yes',d.wcaBeforeCourse,'I had a Work Capability Assessment and was found to have limited capability before starting this course.')}
        ${radio('ucWcaBeforeCourse','no',d.wcaBeforeCourse,'No / not sure.')}
        <hr>
        <label class="choice"><input id="ucNoParents" type="checkbox" ${checked(d.noParentalSupport)}><span>I am under 21 and do not have parental support.</span></label>
        <label class="choice"><input id="ucResponsibleChild" type="checkbox" ${checked(d.responsibleChild)}><span>I am responsible for a child.</span></label>
        <label class="choice"><input id="ucFitNote" type="checkbox" ${checked(d.healthFitNote)}><span>I have a health condition/disability and medical evidence such as a fit note.</span></label>
        <label class="choice"><input id="ucCares" type="checkbox" ${checked(d.caresForDisabled)}><span>I care for someone who gets a qualifying disability-related benefit.</span></label>
      </fieldset>
      <div class="form-grid two"><label class="field"><span>No student loan or maintenance grant available?</span><select id="ucNoStudentFinance"><option value="yes" ${selected(d.noStudentFinance,'yes')}>Yes</option><option value="no" ${selected(d.noStudentFinance,'no')}>No / I get student finance</option></select></label><label class="field"><span>Available for work where the rules require it?</span><select id="ucAvailableWork"><option value="yes" ${selected(d.availableForWork,'yes')}>Yes</option><option value="no" ${selected(d.availableForWork,'no')}>No / not sure</option></select></label></div>`;
    } else if(step===1){
      html += `<h2 class="step-title">Work, savings and extra amounts</h2><p class="step-intro">Universal Credit changes with household earnings, savings and certain extra elements.</p>
      <div class="form-grid two">
        <label class="field"><span>Your monthly take-home earnings</span><input id="ucEarnings" type="number" min="0" step="0.01" value="${num(d.earnings)}"></label>
        <label class="field"><span>Partner's monthly take-home earnings</span><input id="ucPartnerEarnings" type="number" min="0" step="0.01" value="${num(d.partnerEarnings)}"></label>
        <label class="field"><span>Total household savings and investments</span><input id="ucSavings" type="number" min="0" step="1" value="${num(d.savings)}"></label>
        <label class="field"><span>Number of children you are responsible for</span><input id="ucChildren" type="number" min="0" max="10" value="${num(d.children)}"></label>
        <label class="field"><span>Was your first child born before 6 April 2017?</span><select id="ucFirstChildPre"><option value="no" ${selected(d.firstChildPre2017,'no')}>No / not applicable</option><option value="yes" ${selected(d.firstChildPre2017,'yes')}>Yes</option></select></label>
        <label class="field"><span>Health element for this training scenario</span><select id="ucLcwra"><option value="none" ${selected(d.lcwra,'none')}>No LCWRA amount</option><option value="lower" ${selected(d.lcwra,'lower')}>Lower LCWRA rate (new claim where conditions fit)</option><option value="higher" ${selected(d.lcwra,'higher')}>Higher LCWRA rate (protected/severe/lifelong rules fit)</option></select></label>
      </div>
      <fieldset class="question-box"><legend>Caring</legend><label class="choice"><input id="ucCarerEligible" type="checkbox" ${checked(d.carerEligible)}><span>I care for a severely disabled person for at least 35 hours a week and meet the carer-element rules.</span></label><p class="small muted">If the same claimant qualifies for both a carer element and LCWRA, the calculator uses the higher applicable element rather than adding both.</p></fieldset>`;
    } else if(step===2){
      html += `<h2 class="step-title">Where you live</h2><p class="step-intro">Housing support depends on the type of home, rent liability, age and Local Housing Allowance rules.</p>
      <div class="form-grid two">
        <label class="field"><span>Living situation</span><select id="ucHome"><option value="parents" ${selected(d.home,'parents')}>Living with parent(s) / guardian(s)</option><option value="private" ${selected(d.home,'private')}>Private rent</option><option value="social" ${selected(d.home,'social')}>Council or housing association rent</option><option value="supported" ${selected(d.home,'supported')}>Supported / sheltered / temporary accommodation</option><option value="owner" ${selected(d.home,'owner')}>Home owner</option></select></label>
        <label class="field"><span>Do you have a genuine legal liability to pay rent?</span><select id="ucLegalRent"><option value="no" ${selected(d.legalRent,'no')}>No</option><option value="yes" ${selected(d.legalRent,'yes')}>Yes</option></select></label>
        <label class="field"><span>Monthly eligible rent / service charges</span><input id="ucRent" type="number" min="0" step="0.01" value="${num(d.rent)}"></label>
        <label class="field"><span>Private rent area</span><select id="ucLhaArea"><option value="leeds" ${selected(d.lhaArea,'leeds')}>Leeds training rates</option><option value="other" ${selected(d.lhaArea,'other')}>Other area — enter LHA manually</option></select></label>
        <label class="field"><span>Local Housing Allowance category</span><select id="ucLhaCategory"><option value="shared" ${selected(d.lhaCategory,'shared')}>Shared accommodation rate</option><option value="oneBed" ${selected(d.lhaCategory,'oneBed')}>1 bedroom</option><option value="twoBed" ${selected(d.lhaCategory,'twoBed')}>2 bedrooms</option><option value="threeBed" ${selected(d.lhaCategory,'threeBed')}>3 bedrooms</option><option value="fourBed" ${selected(d.lhaCategory,'fourBed')}>4 bedrooms</option></select></label>
        <label class="field"><span>Manual monthly LHA (other areas)</span><input id="ucManualLha" type="number" min="0" step="0.01" value="${num(d.manualLha)}"></label>
        <label class="field"><span>Other adults aged 21+ living with you (not partner)</span><input id="ucNonDeps" type="number" min="0" max="8" value="${num(d.nonDeps)}"></label>
        <label class="field"><span>Spare bedrooms in social housing</span><select id="ucSpareRooms"><option value="0" ${selected(d.spareRooms,'0')}>None</option><option value="1" ${selected(d.spareRooms,'1')}>1 spare bedroom</option><option value="2" ${selected(d.spareRooms,'2')}>2 or more spare bedrooms</option></select></label>
      </div>
      <div class="info-callout important"><div class="callout-icon">!</div><div><strong>Living with parents</strong><p>Paying board, food or household bills does not automatically create a housing-cost entitlement. The simulator uses £0 housing element for this training scenario unless you are in a qualifying tenancy.</p></div></div>`;
    } else if(step===3){
      html += `<h2 class="step-title">Claim details and evidence</h2><p class="step-intro">A real application asks for identity, bank and contact information. Use made-up details here.</p>
      <div class="form-grid two">
        <label class="field"><span>Fictional National Insurance number</span><input id="ucNi" value="${esc(d.ni||'TR 00 00 00 A')}" autocomplete="off"><small>Use a clearly fictional training number.</small></label>
        <label class="field"><span>Payment account</span><select id="ucBank"><option value="training" ${selected(d.bank,'training')}>PLC Bank training account</option><option value="other" ${selected(d.bank,'other')}>Other fictional bank account</option></select></label>
        <label class="field"><span>Preferred communication support</span><select id="ucComms"><option value="standard" ${selected(d.comms,'standard')}>Standard online messages</option><option value="easyread" ${selected(d.comms,'easyread')}>Easy read / simple language</option><option value="support" ${selected(d.comms,'support')}>Support from an appointee / advocate</option></select></label>
      </div>
      <fieldset class="question-box"><legend>Before continuing</legend><label class="choice"><input id="ucConfirm" type="checkbox" ${checked(d.confirmTraining)}><span>I understand this is a training calculator and not an official claim.</span></label></fieldset>
      <h3>Useful evidence in a real claim</h3><ul class="tick-list"><li>Identity and National Insurance details</li><li>Bank details</li><li>Income and savings information</li><li>Tenancy and rent information if claiming housing costs</li><li>Fit notes and health evidence if reporting a health condition</li></ul>`;
    } else {
      const result = calculateUc(d);
      html += renderUcResult(result,d);
    }
    html += actions(step,total) + appSide('Why these questions matter', ucSideText(step));
    html += `</div>`;
    $('#ucApp').innerHTML = html;
    bindUc(step,total);
  }

  function ucSideText(step){
    const bits = [
      '<p>People in full-time education have extra Universal Credit rules. Some disabled learners can qualify where the disability-benefit and Work Capability Assessment conditions are met.</p>',
      `<p>Savings over ${money(DATA.uc.capital.ignoredUpTo)} can reduce Universal Credit. Savings of ${money(DATA.uc.capital.maximum)} or more will usually prevent a new award.</p>`,
      '<p>Housing support normally needs an eligible rent liability. Private rent can also be limited by Local Housing Allowance.</p>',
      '<p>Real claims may ask for evidence and can include identity checks, appointments and a claimant commitment.</p>',
      '<p>The total here is deliberately labelled an estimate. Deductions, benefit caps, exact earnings periods and some special rules are not fully modelled.</p>'
    ]; return bits[step] || bits[0];
  }

  function collectUc(step){
    const d=state.uc;
    if(step===0){
      d.name=$('#ucName').value.trim(); d.age=num($('#ucAge').value,18); d.relationship=$('#ucRelationship').value; d.partnerAge=num($('#ucPartnerAge').value,18); d.education=$('#ucEducation').value; d.afterSep19=$('#ucAfterSep19').value;
      d.pipDaily=$('input[name="ucPipDaily"]:checked')?.value || 'no'; d.wcaBeforeCourse=$('input[name="ucWcaBeforeCourse"]:checked')?.value || 'no'; d.noParentalSupport=$('#ucNoParents').checked?'yes':'no'; d.responsibleChild=$('#ucResponsibleChild').checked?'yes':'no'; d.healthFitNote=$('#ucFitNote').checked?'yes':'no'; d.caresForDisabled=$('#ucCares').checked?'yes':'no'; d.noStudentFinance=$('#ucNoStudentFinance').value; d.availableForWork=$('#ucAvailableWork').value;
    } else if(step===1){
      d.earnings=num($('#ucEarnings').value); d.partnerEarnings=num($('#ucPartnerEarnings').value); d.savings=num($('#ucSavings').value); d.children=Math.max(0,Math.floor(num($('#ucChildren').value))); d.firstChildPre2017=$('#ucFirstChildPre').value; d.lcwra=$('#ucLcwra').value; d.carerEligible=$('#ucCarerEligible').checked?'yes':'no';
    } else if(step===2){
      d.home=$('#ucHome').value; d.legalRent=$('#ucLegalRent').value; d.rent=num($('#ucRent').value); d.lhaArea=$('#ucLhaArea').value; d.lhaCategory=$('#ucLhaCategory').value; d.manualLha=num($('#ucManualLha').value); d.nonDeps=Math.max(0,Math.floor(num($('#ucNonDeps').value))); d.spareRooms=$('#ucSpareRooms').value;
    } else if(step===3){
      d.ni=$('#ucNi').value.trim(); d.bank=$('#ucBank').value; d.comms=$('#ucComms').value; d.confirmTraining=$('#ucConfirm').checked;
    }
    saveState();
  }
  function bindUc(step,total){
    $$('[data-step-action]', $('#ucApp')).forEach(btn=>btn.addEventListener('click',()=>{
      if(step<total-1) collectUc(step);
      if(btn.dataset.stepAction==='back') state.uc.step=Math.max(0,step-1);
      else if(step===total-1){ state.uc.step=0; nav('applications'); return; }
      else state.uc.step=Math.min(total-1,step+1);
      saveState(); renderUc(); window.scrollTo({top:0,behavior:'smooth'});
    }));
  }

  function assessUcEligibility(d){
    const reasons=[]; let status='likely';
    if(num(d.savings)>=DATA.uc.capital.maximum){ status='unlikely'; reasons.push(`Savings are ${money(DATA.uc.capital.maximum)} or more.`); }
    if(num(d.age)<16){ status='unlikely'; reasons.push('Universal Credit is not available below age 16.'); }
    if(num(d.age)===16 || num(d.age)===17){
      const exception=yn(d.healthFitNote)||yn(d.caresForDisabled)||yn(d.responsibleChild)||yn(d.noParentalSupport);
      if(!exception){status='unlikely';reasons.push('Aged 16 or 17 without a recorded exception.');} else {status=status==='unlikely'?'unlikely':'maybe';reasons.push('Aged 16 or 17: an exception may apply, but the full rules need checking.');}
    }
    if(String(d.education).startsWith('full')){
      const disabledStudent=yn(d.pipDaily)&&yn(d.wcaBeforeCourse);
      const child=yn(d.responsibleChild);
      const unsupported=String(d.education)==='full-nonadvanced' && num(d.age)<=21 && yn(d.noParentalSupport);
      const olderNonAdvanced=String(d.education)==='full-nonadvanced' && yn(d.afterSep19) && yn(d.noStudentFinance) && yn(d.availableForWork);
      if(!(disabledStudent||child||unsupported||olderNonAdvanced)){
        status='unlikely'; reasons.push('Full-time education is recorded without a student exception in this training scenario.');
      } else if(status!=='unlikely'){ status='maybe'; reasons.push('A student exception appears possible; DWP would check the details and evidence.'); }
    }
    if(!reasons.length) reasons.push('The basic training checks do not show an obvious barrier, but residence and other detailed rules are not modelled.');
    return {status,reasons};
  }

  function calculateUc(d){
    const eligibility=assessUcEligibility(d);
    const age=num(d.age,18); const partnerAge=num(d.partnerAge,18); const couple=d.relationship==='couple';
    let standard = couple ? ((age>=25||partnerAge>=25)?DATA.uc.standard.coupleOne25Plus:DATA.uc.standard.coupleBothUnder25) : (age>=25?DATA.uc.standard.single25Plus:DATA.uc.standard.singleUnder25);
    let children=0;
    const childCount=Math.max(0,Math.floor(num(d.children)));
    if(childCount>0){ children = (yn(d.firstChildPre2017)?DATA.uc.child.firstPre2017:DATA.uc.child.other) + Math.max(0,childCount-1)*DATA.uc.child.other; }
    let health= d.lcwra==='higher'?DATA.uc.lcwra.higher : d.lcwra==='lower'?DATA.uc.lcwra.lower : 0;
    let carer= yn(d.carerEligible)?DATA.uc.carerElement:0;
    let overlapNote='';
    if(health>0 && carer>0){ carer=0; overlapNote='The same claimant cannot normally receive both LCWRA and the carer element, so the estimate keeps the LCWRA amount.'; }
    let housing=0, housingNote='No housing amount included.';
    if(d.home==='private' && yn(d.legalRent) && num(d.rent)>0){
      const cap = d.lhaArea==='leeds' ? num(DATA.uc.leedsLha[d.lhaCategory]) : num(d.manualLha);
      housing=Math.min(num(d.rent),cap||num(d.rent));
      if(num(d.nonDeps)>0 && !yn(d.pipDaily)) housing=Math.max(0,housing-(num(d.nonDeps)*DATA.uc.nonDepHousingDeduction));
      housingNote=`Private rent estimate capped at ${money(cap||num(d.rent))} for the selected LHA category.`;
    } else if(d.home==='social' && yn(d.legalRent) && num(d.rent)>0){
      housing=num(d.rent);
      if(String(d.spareRooms)==='1') housing*=0.86;
      if(String(d.spareRooms)==='2') housing*=0.75;
      if(num(d.nonDeps)>0 && !yn(d.pipDaily)) housing=Math.max(0,housing-(num(d.nonDeps)*DATA.uc.nonDepHousingDeduction));
      housingNote='Social-rent estimate includes the selected spare-room reduction and non-dependant contribution where applicable.';
    } else if(d.home==='supported') housingNote='Supported, sheltered or temporary accommodation can use different housing rules; Housing Benefit may cover the rent instead.';
    else if(d.home==='parents') housingNote='No housing element included for living with parents in this training scenario.';
    else if(d.home==='owner') housingNote='No rent housing element included for a home owner; Support for Mortgage Interest is a separate loan with different rules.';

    const maxAward=standard+children+health+carer+housing;
    const earnings=num(d.earnings)+ (couple?num(d.partnerEarnings):0);
    const hasWorkAllowance=childCount>0 || health>0;
    const allowance=hasWorkAllowance?(housing>0?DATA.uc.workAllowance.withHousing:DATA.uc.workAllowance.withoutHousing):0;
    const earningsReduction=Math.max(0,earnings-allowance)*DATA.uc.taper;
    let capitalReduction=0;
    const savings=num(d.savings);
    if(savings>DATA.uc.capital.ignoredUpTo && savings<DATA.uc.capital.maximum){ capitalReduction=Math.ceil((savings-DATA.uc.capital.ignoredUpTo)/250)*DATA.uc.capital.tariffPer250; }
    const estimate=Math.max(0,maxAward-earningsReduction-capitalReduction);
    return {eligibility,standard,children,health,carer,housing,maxAward,earnings,allowance,earningsReduction,capitalReduction,estimate,housingNote,overlapNote};
  }

  function renderUcResult(r,d){
    const statusTitle=r.eligibility.status==='likely'?'No obvious barrier in this training check':r.eligibility.status==='maybe'?'Eligibility needs more checking':'This scenario is unlikely to qualify';
    return `<h2 class="step-title">Indicative Universal Credit result</h2><p class="step-intro">This is a teaching estimate, not an official calculation.</p>
      <div class="info-callout ${r.eligibility.status==='unlikely'?'danger':r.eligibility.status==='likely'?'success':'important'}"><div class="callout-icon">${r.eligibility.status==='unlikely'?'!':'i'}</div><div><strong>${statusTitle}</strong>${r.eligibility.reasons.map(x=>`<p>${esc(x)}</p>`).join('')}</div></div>
      <table class="estimate-table"><thead><tr><th>Part of maximum award</th><th>Training amount / month</th></tr></thead><tbody>
        <tr><td>Standard allowance</td><td>${money(r.standard)}</td></tr>
        ${r.children?`<tr><td>Child element(s)</td><td>${money(r.children)}</td></tr>`:''}
        ${r.health?`<tr><td>LCWRA health element</td><td>${money(r.health)}</td></tr>`:''}
        ${r.carer?`<tr><td>Carer element</td><td>${money(r.carer)}</td></tr>`:''}
        ${r.housing?`<tr><td>Housing element estimate</td><td>${money(r.housing)}</td></tr>`:''}
        <tr><td><strong>Maximum before reductions</strong></td><td><strong>${money(r.maxAward)}</strong></td></tr>
        <tr><td>Earnings reduction${r.allowance?` (after ${money(r.allowance)} work allowance)`:''}</td><td>− ${money(r.earningsReduction)}</td></tr>
        <tr><td>Savings / tariff-income reduction</td><td>− ${money(r.capitalReduction)}</td></tr>
      </tbody></table>
      <div class="big-total"><div><span class="muted small">Indicative monthly Universal Credit</span><div class="small muted">If the scenario is eligible and before other deductions/caps</div></div><strong>${money(r.estimate)}</strong></div>
      <div class="info-callout"><div class="callout-icon">⌂</div><div><strong>Housing note</strong><p>${esc(r.housingNote)}</p></div></div>
      ${r.overlapNote?`<div class="info-callout important"><div class="callout-icon">!</div><div><strong>Overlapping elements</strong><p>${esc(r.overlapNote)}</p></div></div>`:''}
      <div class="panel spacer-top"><h3>Not fully modelled</h3><p class="small muted">Benefit cap, sanctions, advance repayments, debt deductions, transitional protection, detailed childcare rules, immigration/residence rules, exact earnings assessment periods and some housing exceptions.</p><button class="secondary-button" onclick="window.print()">Print training result</button></div>`;
  }

  // PIP
  function renderPip(){
    const d=state.pip; const total=5; const step=Math.max(0,Math.min(total-1,num(d.step)));
    let html=`<div class="application-shell">${appHeader('PIP practice','Explore the 12 assessed activities and see how points can translate into an indicative award.',step,total)}`;
    if(step===0){
      html+=`<h2 class="step-title">About the condition or disability</h2><p class="step-intro">PIP is about how a long-term condition affects function. Income and savings do not decide the amount.</p>
      <div class="form-grid two"><label class="field"><span>Age</span><input id="pipAge" type="number" min="16" max="100" value="${num(d.age,18)}"></label><label class="field"><span>Have you reached State Pension age?</span><select id="pipPensionAge"><option value="no" ${selected(d.reachedPensionAge,'no')}>No</option><option value="yes" ${selected(d.reachedPensionAge,'yes')}>Yes</option></select></label><label class="field"><span>Have the difficulties already affected you for around 3 months?</span><select id="pipPast"><option value="yes" ${selected(d.hadDifficulties3Months,'yes')}>Yes</option><option value="no" ${selected(d.hadDifficulties3Months,'no')}>No</option></select></label><label class="field"><span>Are they expected to continue for at least another 9 months?</span><select id="pipFuture"><option value="yes" ${selected(d.expected9Months,'yes')}>Yes</option><option value="no" ${selected(d.expected9Months,'no')}>No</option></select></label></div>
      <div class="info-callout"><div class="callout-icon">i</div><div><strong>How to answer the activity questions</strong><p>Think about whether you can do an activity safely, to an acceptable standard, repeatedly and in a reasonable time. Choose the option that best describes most days.</p></div></div>`;
    } else if(step===1){ html+=pipActivitiesHtml(DATA.pipActivities.filter((a,i)=>a.group==='daily'&&i<5)); }
    else if(step===2){ html+=pipActivitiesHtml(DATA.pipActivities.filter((a,i)=>a.group==='daily'&&i>=5)); }
    else if(step===3){ html+=pipActivitiesHtml(DATA.pipActivities.filter(a=>a.group==='mobility')); }
    else { html+=renderPipResult(); }
    html+=actions(step,total)+appSide('PIP training notes', pipSide(step)); html+='</div>';
    $('#pipApp').innerHTML=html; bindPip(step,total);
  }
  function pipActivitiesHtml(list){
    const title=list[0]?.group==='mobility'?'Mobility activities':'Daily living activities';
    return `<h2 class="step-title">${title}</h2><p class="step-intro">Select one option for each activity. The points are shown so learners can understand the structure.</p>${list.map(a=>{
      const saved=state.pip.scores[a.id];
      return `<section class="pip-activity" data-activity="${a.id}"><h3>${esc(a.title)}</h3><div class="activity-help">${esc(a.help)}</div><div class="pip-options">${a.options.map((o,idx)=>`<label class="pip-option"><input type="radio" name="pip_${a.id}" value="${idx}" ${saved&&Number(saved.idx)===idx?'checked':''}><span>${esc(o[1])}</span><span class="pip-score">${o[0]} pts</span></label>`).join('')}</div></section>`;
    }).join('')}`;
  }
  function pipSide(step){
    if(step===0) return '<p>PIP normally requires a long-term difficulty. New claims are usually for people aged 16 or over and below State Pension age.</p>';
    if(step===1||step===2) return '<p>Daily living has 10 activities. Scores are added together. In the real process, evidence and reliability rules are important.</p>';
    if(step===3) return '<p>Mobility has 2 activities: planning/following journeys and moving around. Mental, cognitive, sensory and physical effects can all be relevant depending on the activity.</p>';
    return `<p>For each component, 8–11 points indicates the standard rate and 12+ points indicates the enhanced rate in the points system.</p>`;
  }
  function collectPip(step){
    if(step===0){ state.pip.age=num($('#pipAge').value,18);state.pip.reachedPensionAge=$('#pipPensionAge').value;state.pip.hadDifficulties3Months=$('#pipPast').value;state.pip.expected9Months=$('#pipFuture').value; }
    if(step===1||step===2||step===3){
      $$('.pip-activity',$('#pipApp')).forEach(box=>{
        const id=box.dataset.activity; const radio=$(`input[name="pip_${id}"]:checked`,box); if(radio){ const idx=num(radio.value); const act=DATA.pipActivities.find(a=>a.id===id); state.pip.scores[id]={idx,points:act.options[idx][0]}; }
      });
    }
    saveState();
  }
  function bindPip(step,total){
    $$('[data-step-action]',$('#pipApp')).forEach(btn=>btn.addEventListener('click',()=>{
      if(step<total-1) collectPip(step);
      if(btn.dataset.stepAction==='back') state.pip.step=Math.max(0,step-1);
      else if(step===total-1){state.pip.step=0;nav('applications');return;} else state.pip.step=Math.min(total-1,step+1);
      saveState();renderPip();window.scrollTo({top:0,behavior:'smooth'});
    }));
  }
  function pipAward(points, rates){
    if(points>=DATA.pip.threshold.enhanced) return {name:'Enhanced rate',weekly:rates.enhanced};
    if(points>=DATA.pip.threshold.standard) return {name:'Standard rate',weekly:rates.standard};
    return {name:'No award indicated by points',weekly:0};
  }
  function renderPipResult(){
    const s=state.pip.scores; let daily=0,mobility=0,missing=[];
    DATA.pipActivities.forEach(a=>{ if(!s[a.id]) missing.push(a.title); else if(a.group==='daily') daily+=num(s[a.id].points); else mobility+=num(s[a.id].points); });
    const dailyAward=pipAward(daily,DATA.pip.dailyLiving),mobilityAward=pipAward(mobility,DATA.pip.mobility);
    const age=num(state.pip.age); const durationOk=yn(state.pip.hadDifficulties3Months)&&yn(state.pip.expected9Months); const ageOk=age>=16 && !yn(state.pip.reachedPensionAge);
    const weekly=dailyAward.weekly+mobilityAward.weekly, fourWeekly=weekly*4, monthlyEq=weekly*52/12;
    return `<h2 class="step-title">Indicative PIP result</h2><p class="step-intro">This points exercise is educational. DWP makes the real decision after considering evidence and how reliably activities can be completed.</p>
      ${missing.length?`<div class="info-callout important"><div class="callout-icon">!</div><div><strong>${missing.length} activities are unanswered.</strong><p>Unanswered activities count as 0 in this training result.</p></div></div>`:''}
      ${(!ageOk||!durationOk)?`<div class="info-callout danger"><div class="callout-icon">!</div><div><strong>Basic qualifying-period check needs attention.</strong><p>${age<16?'The age entered is below 16. ':''}${yn(state.pip.reachedPensionAge)?'New PIP claims are usually not the route once State Pension age has been reached; check Attendance Allowance instead. ':''}${!durationOk?'The training answers do not show the normal 3-month past and 9-month future period.':''}</p></div></div>`:''}
      <div class="score-panel"><div class="score-card"><span>Daily living score</span><strong>${daily}</strong><span class="award-chip">${dailyAward.name}</span><p>${dailyAward.weekly?`${money(dailyAward.weekly)} per week`:''}</p></div><div class="score-card"><span>Mobility score</span><strong>${mobility}</strong><span class="award-chip">${mobilityAward.name}</span><p>${mobilityAward.weekly?`${money(mobilityAward.weekly)} per week`:''}</p></div></div>
      <table class="estimate-table"><tbody><tr><td>Estimated weekly total</td><td>${money(weekly)}</td></tr><tr><td>Typical 4-week payment</td><td>${money(fourWeekly)}</td></tr><tr><td>Monthly equivalent for budgeting</td><td>${money(monthlyEq)}</td></tr></tbody></table>
      <div class="info-callout"><div class="callout-icon">i</div><div><strong>PIP is not means-tested.</strong><p>Income and savings do not reduce the PIP rate. The decision is based on functional difficulties and evidence.</p></div></div>
      <div class="panel spacer-top"><h3>Evidence ideas</h3><ul class="tick-list"><li>Examples of what happens on good and bad days</li><li>How often help, prompting or supervision is needed</li><li>Reports from health, care or education professionals where relevant</li><li>Medication or therapy information</li><li>Details of aids, adaptations and support used</li></ul><button class="secondary-button" onclick="window.print()">Print training result</button></div>`;
  }

  // SIMPLE APPLICATIONS
  function simpleShell(target,title,subtitle,body,side='Use fictional details only.'){
    target.innerHTML=`<div class="application-shell"><div class="application-header"><div><span class="app-badge">Training application</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><button class="secondary-button" data-nav="applications">Exit application</button></div><div class="application-body"><div class="application-main">${body}</div><aside class="application-side"><div class="side-section"><h3>Training note</h3><p>${side}</p></div><div class="side-section"><h3>Not an official claim</h3><p>No information entered here is sent to DWP, a council or an employer.</p></div></aside></div></div>`;
  }

  function renderCarers(){
    const d=state.carers;
    simpleShell($('#carersApp'),"Carer's Allowance practice",'Check the main training criteria and estimate the weekly amount.',`
      <h2 class="step-title">Your caring situation</h2>
      <form id="carersForm" class="form-card">
        <div class="form-grid two"><label class="field"><span>Age</span><input id="caAge" type="number" min="16" value="${num(d.age,18)}"></label><label class="field"><span>Hours of care each week</span><input id="caHours" type="number" min="0" value="${num(d.hours,35)}"></label><label class="field"><span>Does the person receive a qualifying disability benefit?</span><select id="caQual"><option value="yes" ${selected(d.qual,'yes')}>Yes</option><option value="no" ${selected(d.qual,'no')}>No / not sure</option></select></label><label class="field"><span>Are you in full-time education or studying 21+ hours a week?</span><select id="caStudy"><option value="no" ${selected(d.study,'no')}>No</option><option value="yes" ${selected(d.study,'yes')}>Yes</option></select></label><label class="field"><span>Weekly earnings after tax, NI and allowable expenses</span><input id="caEarn" type="number" min="0" step="0.01" value="${num(d.earn,0)}"></label></div>
        <button class="primary-button spacer-top" type="submit">Check training result</button>
      </form><div id="caResult"></div>`, `The ${esc(DATA.rateYear)} earnings limit used in this training tool is ${money(DATA.carers.earningsLimitWeekly)} a week after specified deductions/expenses.`);
    $('#carersForm').addEventListener('submit',e=>{e.preventDefault(); const x={age:num($('#caAge').value),hours:num($('#caHours').value),qual:$('#caQual').value,study:$('#caStudy').value,earn:num($('#caEarn').value)};state.carers=x;saveState();const issues=[];if(x.age<16)issues.push('You must be at least 16.');if(x.hours<DATA.carers.careHours)issues.push(`The training answer is below ${DATA.carers.careHours} hours of care.`);if(x.qual!=='yes')issues.push('The person being cared for must receive a qualifying disability benefit.');if(x.study==='yes')issues.push('Full-time education / 21+ study hours can prevent Carer’s Allowance.');if(x.earn>DATA.carers.earningsLimitWeekly)issues.push(`Weekly earnings are above the ${money(DATA.carers.earningsLimitWeekly)} training limit.`);$('#caResult').innerHTML=issues.length?`<div class="info-callout danger"><div class="callout-icon">!</div><div><strong>Unlikely on these answers</strong>${issues.map(i=>`<p>${esc(i)}</p>`).join('')}</div></div>`:`<div class="calculator-box success-box"><span>Indicative weekly Carer's Allowance</span><span class="amount">${money(DATA.carers.weekly)}</span><span class="subamount">About ${money(DATA.carers.weekly*52/12)} per calendar month for budgeting</span></div><div class="info-callout important"><div class="callout-icon">!</div><div><strong>Check interactions</strong><p>Carer’s Allowance can affect other benefits for you and the person you care for.</p></div></div>`;});
  }

  function renderEsa(){
    const d=state.esa;
    simpleShell($('#esaApp'),'New Style ESA practice','Explore health, fit note and National Insurance questions.',`
      <h2 class="step-title">Health and contribution check</h2><form id="esaForm" class="form-card"><div class="form-grid two"><label class="field"><span>Age</span><input id="esaAge" type="number" min="18" value="${num(d.age,18)}"></label><label class="field"><span>Does a health condition or disability limit your ability to work?</span><select id="esaHealth"><option value="yes" ${selected(d.health,'yes')}>Yes</option><option value="no" ${selected(d.health,'no')}>No</option></select></label><label class="field"><span>Do you have medical evidence / a fit note where required?</span><select id="esaFit"><option value="yes" ${selected(d.fit,'yes')}>Yes</option><option value="no" ${selected(d.fit,'no')}>No / not yet</option></select></label><label class="field"><span>Have you paid or been credited with enough National Insurance in the relevant tax years?</span><select id="esaNi"><option value="yes" ${selected(d.ni,'yes')}>Yes</option><option value="unsure" ${selected(d.ni,'unsure')}>Not sure</option><option value="no" ${selected(d.ni,'no')}>No</option></select></label><label class="field"><span>Training outcome after assessment</span><select id="esaGroup"><option value="assessment" ${selected(d.group,'assessment')}>Assessment phase</option><option value="support" ${selected(d.group,'support')}>Support group / support component</option></select></label><label class="field"><span>Also claiming Universal Credit?</span><select id="esaUc"><option value="no" ${selected(d.uc,'no')}>No</option><option value="yes" ${selected(d.uc,'yes')}>Yes</option></select></label></div><button class="primary-button spacer-top" type="submit">Check training result</button></form><div id="esaResult"></div>`, 'New Style ESA is contribution-based, so a young person who has not built up enough National Insurance may not qualify even if they have a health condition.');
    $('#esaForm').addEventListener('submit',e=>{e.preventDefault();const x={age:num($('#esaAge').value),health:$('#esaHealth').value,fit:$('#esaFit').value,ni:$('#esaNi').value,group:$('#esaGroup').value,uc:$('#esaUc').value};state.esa=x;saveState();let status='likely',notes=[];if(x.health!=='yes'){status='unlikely';notes.push('No work-limiting health condition is recorded.');}if(x.ni==='no'){status='unlikely';notes.push('The National Insurance condition is not met in this scenario.');}if(x.ni==='unsure'&&status!=='unlikely'){status='maybe';notes.push('National Insurance record needs checking.');}if(x.fit!=='yes'&&status!=='unlikely'){status='maybe';notes.push('Medical evidence / fit note may be needed.');}const base=x.age<25?DATA.esa.assessmentUnder25:DATA.esa.assessment25Plus;const weekly=base+(x.group==='support'?DATA.esa.supportComponent:0);$('#esaResult').innerHTML=`<div class="result-card ${status}"><span class="status">${status==='likely'?'Likely relevant':status==='maybe'?'Needs checking':'Unlikely'}</span><h3>New Style ESA training check</h3>${notes.map(n=>`<p>${esc(n)}</p>`).join('')}<p><strong>Illustrative weekly amount:</strong> ${money(weekly)}</p>${x.uc==='yes'?'<p>When New Style ESA and Universal Credit are paid together, the ESA payment is normally taken into account in the Universal Credit award.</p>':''}</div>`;});
  }

  function renderHousing(){
    const d=state.housing;
    simpleShell($('#housingApp'),'Housing Benefit practice','Learn when a new Housing Benefit claim is still used.',`
      <h2 class="step-title">Accommodation check</h2><form id="hbForm" class="form-card"><div class="form-grid two"><label class="field"><span>Have you reached State Pension age?</span><select id="hbPension"><option value="no" ${selected(d.pension,'no')}>No</option><option value="yes" ${selected(d.pension,'yes')}>Yes</option></select></label><label class="field"><span>Accommodation type</span><select id="hbHome"><option value="general" ${selected(d.home,'general')}>General private/social rented home</option><option value="supported" ${selected(d.home,'supported')}>Supported or sheltered housing with care/support/supervision</option><option value="temporary" ${selected(d.home,'temporary')}>Temporary accommodation arranged by a council</option><option value="refuge" ${selected(d.home,'refuge')}>Refuge</option></select></label><label class="field"><span>Monthly rent</span><input id="hbRent" type="number" min="0" step="0.01" value="${num(d.rent,0)}"></label></div><button class="primary-button spacer-top" type="submit">Check route</button></form><div id="hbResult"></div>`, 'For most working-age people in ordinary rented housing, help with rent is now through Universal Credit rather than a new Housing Benefit claim.');
    $('#hbForm').addEventListener('submit',e=>{e.preventDefault();const x={pension:$('#hbPension').value,home:$('#hbHome').value,rent:num($('#hbRent').value)};state.housing=x;saveState();const special=['supported','temporary','refuge'].includes(x.home);const possible=x.pension==='yes'||special;$('#hbResult').innerHTML=possible?`<div class="result-card maybe"><span class="status">Housing Benefit route may apply</span><h3>Check with the local council</h3><p>This type of accommodation can still use Housing Benefit. The exact amount depends on council and means-testing rules, so this simulator does not invent a figure.</p></div>`:`<div class="result-card unlikely"><span class="status">Use Universal Credit housing costs instead</span><h3>A new Housing Benefit claim is unlikely</h3><p>For a working-age person in general rented housing, rent support is normally part of Universal Credit.</p><button class="secondary-button" data-open="uc">Open Universal Credit practice</button></div>`;});
  }

  function renderCouncil(){
    const d=state.council;
    simpleShell($('#councilApp'),'Council Tax Reduction practice','Understand what information a council may use.',`
      <h2 class="step-title">Council Tax check</h2><form id="ctForm" class="form-card"><div class="form-grid two"><label class="field"><span>Are you named as the person liable for Council Tax?</span><select id="ctLiable"><option value="yes" ${selected(d.liable,'yes')}>Yes</option><option value="no" ${selected(d.liable,'no')}>No / I live with parents</option></select></label><label class="field"><span>Are you on a low income or receiving benefits?</span><select id="ctLow"><option value="yes" ${selected(d.low,'yes')}>Yes</option><option value="no" ${selected(d.low,'no')}>No</option></select></label><label class="field"><span>Training postcode</span><input id="ctPostcode" value="${esc(d.postcode||'LS1 1AA')}"></label></div><button class="primary-button spacer-top" type="submit">Check training result</button></form><div id="ctResult"></div>`, 'Council Tax Reduction is run by local councils, so the exact calculation varies by area.');
    $('#ctForm').addEventListener('submit',e=>{e.preventDefault();const x={liable:$('#ctLiable').value,low:$('#ctLow').value,postcode:$('#ctPostcode').value};state.council=x;saveState();$('#ctResult').innerHTML=x.liable==='yes'&&x.low==='yes'?`<div class="result-card maybe"><span class="status">May be eligible</span><h3>Apply to the local council</h3><p>The reduction can be substantial and in some schemes may be up to 100%, but the exact amount depends on the council and household circumstances.</p></div>`:`<div class="result-card unlikely"><span class="status">Less likely</span><h3>${x.liable!=='yes'?'You are not the Council Tax liable person in this scenario.':'The low-income condition is not shown.'}</h3><p>Living with parents normally means the learner is not the person named on the Council Tax bill.</p></div>`;});
  }

  function renderAtw(){
    const d=state.atw;
    simpleShell($('#atwApp'),'Access to Work practice','Check whether workplace disability support could be relevant.',`
      <h2 class="step-title">Workplace support check</h2><form id="atwForm" class="form-card"><div class="form-grid two"><label class="field"><span>Age</span><input id="atwAge" type="number" min="16" value="${num(d.age,18)}"></label><label class="field"><span>Paid work status</span><select id="atwWork"><option value="working" ${selected(d.work,'working')}>I am in paid work</option><option value="starting" ${selected(d.work,'starting')}>I am due to start/return to paid work soon</option><option value="volunteer" ${selected(d.work,'volunteer')}>Volunteer only</option><option value="none" ${selected(d.work,'none')}>No paid work arranged</option></select></label><label class="field"><span>Do you have a disability or health condition that creates a barrier at work or travelling to work?</span><select id="atwNeed"><option value="yes" ${selected(d.need,'yes')}>Yes</option><option value="no" ${selected(d.need,'no')}>No</option></select></label><label class="field"><span>Will you live and work in England, Scotland or Wales?</span><select id="atwGb"><option value="yes" ${selected(d.gb,'yes')}>Yes</option><option value="no" ${selected(d.gb,'no')}>No</option></select></label></div><button class="primary-button spacer-top" type="submit">Check training result</button></form><div id="atwResult"></div>`, 'Access to Work can include support workers, specialist equipment, assistive software or some extra travel-to-work costs. It is not a normal weekly benefit payment.');
    $('#atwForm').addEventListener('submit',e=>{e.preventDefault();const x={age:num($('#atwAge').value),work:$('#atwWork').value,need:$('#atwNeed').value,gb:$('#atwGb').value};state.atw=x;saveState();const workOk=['working','starting'].includes(x.work);const ok=x.age>=16&&workOk&&x.need==='yes'&&x.gb==='yes';$('#atwResult').innerHTML=ok?`<div class="result-card likely"><span class="status">Likely relevant</span><h3>Access to Work could be worth applying for</h3><p>The award is based on assessed workplace needs, so there is no single standard amount to calculate.</p><ul class="tick-list"><li>Job coach or support worker</li><li>Specialist equipment or software</li><li>Extra travel support where public transport cannot be used</li><li>Communication support</li></ul></div>`:`<div class="result-card unlikely"><span class="status">Not shown as eligible</span><h3>Check the paid-work conditions</h3><p>Access to Work generally needs paid work (or work about to start), age 16+, a relevant disability/health barrier and work in Great Britain.</p></div>`;});
  }

  function renderAttendance(){
    const d=state.attendance;
    simpleShell($('#attendanceApp'),'Attendance Allowance practice','Later-life disability support included for future awareness.',`
      <h2 class="step-title">Later-life support check</h2><form id="aaForm" class="form-card"><div class="form-grid two"><label class="field"><span>Have you reached State Pension age?</span><select id="aaAge"><option value="no" ${selected(d.age,'no')}>No</option><option value="yes" ${selected(d.age,'yes')}>Yes</option></select></label><label class="field"><span>Level of help or supervision needed</span><select id="aaNeed"><option value="day" ${selected(d.need,'day')}>Frequent help/supervision in the day OR supervision at night</option><option value="both" ${selected(d.need,'both')}>Help/supervision through both day and night</option></select></label></div><button class="primary-button spacer-top" type="submit">Check training result</button></form><div id="aaResult"></div>`, 'This is not normally relevant to current 16–19 learners, but it helps show how disability support changes later in life.');
    $('#aaForm').addEventListener('submit',e=>{e.preventDefault();const x={age:$('#aaAge').value,need:$('#aaNeed').value};state.attendance=x;saveState();if(x.age!=='yes')$('#aaResult').innerHTML=`<div class="result-card unlikely"><span class="status">Not the right age route</span><h3>PIP is usually the adult working-age disability benefit instead</h3><button class="secondary-button" data-open="pip">Open PIP practice</button></div>`;else {const w=x.need==='both'?DATA.attendanceAllowance.higher:DATA.attendanceAllowance.lower;$('#aaResult').innerHTML=`<div class="calculator-box success-box"><span>Indicative weekly Attendance Allowance</span><span class="amount">${money(w)}</span><span class="subamount">Not means-tested; mobility needs are not a separate Attendance Allowance component.</span></div>`;}});
  }

  function loadDemo(){
    state=structuredCloneSafe(defaultState);
    state.pip.scores={
      food:{idx:3,points:2}, nutrition:{idx:0,points:0}, therapy:{idx:1,points:1}, washing:{idx:2,points:2}, toilet:{idx:0,points:0}, dressing:{idx:2,points:2}, communication:{idx:2,points:4}, reading:{idx:2,points:2}, engaging:{idx:2,points:4}, budgeting:{idx:1,points:2}, journeys:{idx:3,points:10}, moving:{idx:0,points:0}
    };
    saveState();
    alert('Fictional practice profile loaded. Open Universal Credit or PIP to see the example.');
  }

  function clearAll(){
    if(confirm('Reset all training answers for this practice session?')){ state=structuredCloneSafe(defaultState); alert('Training answers reset.'); nav('home'); }
  }

  document.addEventListener('click',e=>{
    const navBtn=e.target.closest('[data-nav]'); if(navBtn){ e.preventDefault(); nav(navBtn.dataset.nav); return; }
    const open=e.target.closest('[data-open]'); if(open){ e.preventDefault(); nav(open.dataset.open); }
  });

  $('#finderForm').addEventListener('submit',runFinder);
  $('#loadDemoProfile').addEventListener('click',loadDemo);
  $('#clearAllData').addEventListener('click',clearAll);

  function enableHostedAppFeatures(){
    const hosted = location.protocol === 'https:' || location.protocol === 'http:';
    if(!hosted) return;

    // The web app manifest and service worker only work from an HTTP(S) origin.
    // Adding them only when hosted avoids file:// CORS/security errors when staff
    // open the training app directly from Downloads.
    if(!$('link[rel="manifest"]')){
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = './manifest.webmanifest';
      document.head.appendChild(manifest);
    }

    window.addEventListener('beforeinstallprompt', e=>{
      e.preventDefault();
      deferredInstallPrompt=e;
      $('#installButton').hidden=false;
    });

    $('#installButton').addEventListener('click',async()=>{
      if(!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt=null;
      $('#installButton').hidden=true;
    });

    if('serviceWorker' in navigator){
      window.addEventListener('load',()=>{
        navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('Offline app cache unavailable:', err));
      });
    }
  }

  enableHostedAppFeatures();
  renderStatic();
})();
