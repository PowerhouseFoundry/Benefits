window.BENEFITS_DATA = {
  version: '2026.09.20',
  rateYear: '2026/27',
  validFrom: '2026-04-06',
  validTo: '2027-04-05',
  lastReviewed: '2026-09-20',
  uc: {
    standard: {
      singleUnder25: 338.58,
      single25Plus: 424.90,
      coupleBothUnder25: 528.34,
      coupleOne25Plus: 666.97
    },
    child: {
      firstPre2017: 351.88,
      other: 303.94,
      disabledLower: 164.79,
      disabledHigher: 514.71
    },
    lcwra: { lower: 217.26, higher: 429.80 },
    carerElement: 209.34,
    workAllowance: { withHousing: 427, withoutHousing: 710 },
    taper: 0.55,
    capital: { ignoredUpTo: 6000, maximum: 16000, tariffPer250: 4.35 },
    nonDepHousingDeduction: 96.55,
    leedsLha: { shared: 347.62, oneBed: 675, twoBed: 775, threeBed: 850, fourBed: 1200 }
  },
  pip: {
    dailyLiving: { standard: 76.70, enhanced: 114.60 },
    mobility: { standard: 30.30, enhanced: 80.00 },
    threshold: { standard: 8, enhanced: 12 }
  },
  carers: { weekly: 86.45, earningsLimitWeekly: 204, careHours: 35 },
  esa: {
    assessmentUnder25: 75.65,
    assessment25Plus: 95.55,
    supportComponent: 50.35
  },
  attendanceAllowance: { lower: 76.70, higher: 114.60 },
  sources: [
    { label: 'Universal Credit eligibility', url: 'https://www.gov.uk/universal-credit/eligibility' },
    { label: 'Universal Credit amounts', url: 'https://www.gov.uk/universal-credit/what-youll-get' },
    { label: 'Universal Credit and students', url: 'https://www.gov.uk/guidance/universal-credit-and-students' },
    { label: 'Universal Credit savings rules', url: 'https://www.gov.uk/guidance/universal-credit-money-savings-and-investments' },
    { label: 'Universal Credit housing costs', url: 'https://www.gov.uk/housing-and-universal-credit' },
    { label: 'Official benefit and pension rates used for the configured year', url: 'https://www.gov.uk/government/publications/benefit-and-pension-rates-2026-to-2027/proposed-benefit-and-pension-rates-2026-to-2027' },
    { label: 'PIP eligibility', url: 'https://www.gov.uk/pip/eligibility' },
    { label: 'PIP rates', url: 'https://www.gov.uk/pip/how-much-youll-get' },
    { label: 'PIP assessment guide', url: 'https://www.gov.uk/government/publications/personal-independence-payment-assessment-guide-for-assessment-providers' },
    { label: "Carer's Allowance", url: 'https://www.gov.uk/carers-allowance' },
    { label: 'New Style ESA', url: 'https://www.gov.uk/guidance/new-style-employment-and-support-allowance' },
    { label: 'Housing Benefit eligibility', url: 'https://www.gov.uk/housing-benefit' },
    { label: 'Council Tax Reduction', url: 'https://www.gov.uk/apply-council-tax-reduction' },
    { label: 'Access to Work', url: 'https://www.gov.uk/access-to-work' }
  ],
  pipActivities: [
    {
      id: 'food', group: 'daily', title: 'Preparing food',
      help: 'Think about making and cooking a simple meal safely and reliably.',
      options: [
        [0, 'I can prepare and cook a simple meal without help.'],
        [2, 'I need an aid or adapted equipment.'],
        [2, 'I can use a microwave but cannot safely use a normal cooker.'],
        [2, 'I need another person to remind or encourage me.'],
        [4, 'I need another person to supervise or physically help me.'],
        [8, 'I cannot prepare and cook food.']
      ]
    },
    {
      id: 'nutrition', group: 'daily', title: 'Eating and drinking',
      help: 'Think about cutting food, eating, drinking and any feeding equipment.',
      options: [
        [0, 'I can eat and drink without help.'],
        [2, 'I need an aid, supervision, or help to cut up food.'],
        [2, 'I use a therapeutic feeding source.'],
        [4, 'I need reminding or encouragement to eat or drink.'],
        [6, 'I need another person to help manage a therapeutic feeding source.'],
        [10, 'Another person must bring food or drink to my mouth.']
      ]
    },
    {
      id: 'therapy', group: 'daily', title: 'Managing medication or therapy',
      help: 'Think about medication, monitoring a condition and therapy at home.',
      options: [
        [0, 'I do not need this, or I can manage it without help.'],
        [1, 'I need an aid, prompting, supervision or help with medication/monitoring.'],
        [2, 'I need help with therapy for up to 3.5 hours each week.'],
        [4, 'I need help with therapy for more than 3.5 and up to 7 hours each week.'],
        [6, 'I need help with therapy for more than 7 and up to 14 hours each week.'],
        [8, 'I need help with therapy for more than 14 hours each week.']
      ]
    },
    {
      id: 'washing', group: 'daily', title: 'Washing and bathing',
      help: 'Think about washing your body and getting in or out of a bath or shower.',
      options: [
        [0, 'I can wash and bathe without help.'],
        [2, 'I need an aid or adapted equipment.'],
        [2, 'I need supervision or prompting.'],
        [2, 'I need help to wash my hair or lower body.'],
        [3, 'I need help to get in or out of a bath or shower.'],
        [4, 'I need help to wash my body between shoulders and waist.'],
        [8, 'Another person has to wash my whole body.']
      ]
    },
    {
      id: 'toilet', group: 'daily', title: 'Toilet needs and incontinence',
      help: 'Think about using the toilet, cleaning yourself and managing continence.',
      options: [
        [0, 'I can manage toilet needs and continence without help.'],
        [2, 'I need an aid or adapted equipment.'],
        [2, 'I need supervision or prompting.'],
        [4, 'I need physical help with toilet needs.'],
        [6, 'I need help managing bladder or bowel incontinence.'],
        [8, 'I need help managing both bladder and bowel incontinence.']
      ]
    },
    {
      id: 'dressing', group: 'daily', title: 'Dressing and undressing',
      help: 'Think about choosing suitable clothes and putting them on or taking them off.',
      options: [
        [0, 'I can dress and undress without help.'],
        [2, 'I need an aid or adapted equipment.'],
        [2, 'I need prompting, or help choosing suitable clothes.'],
        [2, 'I need help with my lower body.'],
        [4, 'I need help with my upper body.'],
        [8, 'I cannot dress or undress without another person doing it.']
      ]
    },
    {
      id: 'communication', group: 'daily', title: 'Speaking and understanding',
      help: 'Think about speaking, hearing and understanding spoken information.',
      options: [
        [0, 'I can speak and understand spoken information without help.'],
        [2, 'I need a hearing or communication aid.'],
        [4, 'I need communication support for more complex spoken information.'],
        [8, 'I need communication support for basic spoken information.'],
        [12, 'I cannot express or understand spoken information even with support.']
      ]
    },
    {
      id: 'reading', group: 'daily', title: 'Reading signs, symbols and words',
      help: 'Think about understanding written information, signs and symbols.',
      options: [
        [0, 'I can read and understand basic and complex written information.'],
        [2, 'I need an aid other than normal glasses or contact lenses.'],
        [2, 'I need prompting to understand complex written information.'],
        [4, 'I need prompting to understand basic written information.'],
        [8, 'I cannot read or understand signs, symbols or words.']
      ]
    },
    {
      id: 'engaging', group: 'daily', title: 'Engaging with other people',
      help: 'Think about face-to-face social interaction, distress and safety.',
      options: [
        [0, 'I can engage with other people without help.'],
        [2, 'I need prompting to engage with other people.'],
        [4, 'I need social support from another person.'],
        [8, 'I cannot engage because it causes overwhelming distress or a serious safety risk.']
      ]
    },
    {
      id: 'budgeting', group: 'daily', title: 'Making budgeting decisions',
      help: 'Think about paying bills, planning spending, prices and change.',
      options: [
        [0, 'I can manage complex budgeting decisions without help.'],
        [2, 'I need prompting or help with complex budgeting.'],
        [4, 'I need prompting or help even with simple budgeting.'],
        [6, 'I cannot make budgeting decisions.']
      ]
    },
    {
      id: 'journeys', group: 'mobility', title: 'Planning and following journeys',
      help: 'Think about planning routes, unfamiliar places, distress and needing another person.',
      options: [
        [0, 'I can plan and follow journeys without help.'],
        [4, 'I need prompting to start a journey because of overwhelming distress.'],
        [8, 'I cannot plan the route of a journey.'],
        [10, 'I cannot follow an unfamiliar route without another person, assistance dog or orientation aid.'],
        [10, 'I cannot undertake any journey because it causes overwhelming distress.'],
        [12, 'I cannot follow even a familiar route without another person, assistance dog or orientation aid.']
      ]
    },
    {
      id: 'moving', group: 'mobility', title: 'Moving around',
      help: 'Think about how far you can stand and move safely, repeatedly and in a reasonable time.',
      options: [
        [0, 'More than 200 metres.'],
        [4, 'More than 50 metres but no more than 200 metres.'],
        [8, 'More than 20 metres but no more than 50 metres without an aid.'],
        [10, 'More than 20 metres but no more than 50 metres using an aid.'],
        [12, 'More than 1 metre but no more than 20 metres.'],
        [12, 'I cannot stand or move more than 1 metre.']
      ]
    }
  ]
};
