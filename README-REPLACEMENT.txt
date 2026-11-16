WEST SILC POWERHOUSE | BENEFITS & WORK CAPABILITY PORTAL
DROP-IN REPLACEMENT PROJECT — 16 NOVEMBER 2026

PURPOSE
Training-only fictional DWP-style portal for 16–19 year old learners. It preserves the existing benefit application simulators and adds a WCA practice questionnaire, action plan, current guidance and the teal building-sign banner.

HOW TO REPLACE
1. Back up your existing Benefits project folder (do not delete existing files first).
2. Open the ZIP and copy EVERY file and the whole assets folder into your existing project folder. Choose Replace when asked.
3. Keep the same folder structure: index.html, app.js, benefits-data.js, styles.css, wca.js, service-worker.js, manifest.webmanifest, assets/portal-hero.png, assets/dwp-brand.png, assets/app-icon.png.
4. If your original project has any additional files, leave them in place. Do NOT copy the old .git folder from your ZIP; retain your current project's .git folder.
5. Preview index.html, test the WCA, benefit checker and applications. Deploy using your existing GitHub/Render/Firebase workflow.
6. If an old version appears, force-refresh and reopen the website. The service worker cache version has been changed for this release.

WHAT CHANGED
- New portal dashboard, original DWP-inspired sign banner, sidebar and responsive design.
- Added WCA practice with Yes / No / I don't know, grouped sections, print-friendly results and personalised prompts for unknown answers.
- WCA results can prefill benefit finder age/education/health fields and suggest benefit practice forms.
- Added guidance section distinguishing existing rules, the 14 Nov 2026 Jobs Guarantee announcement and the still-pending final Milburn Review (as at 16 Nov).
- Retained original benefits-data.js, UC/PIP/carers/ESA/housing/council/Access to Work/Attendance Allowance practice forms, and existing calculation logic unchanged.
- No cloud database, no learner accounts, and practice answers do not persist across reloads.

IMPORTANT
This site does not make a real claim or decide WCA fitness/benefit eligibility. The WCA section is an educational simplification, not the official WCA50 questionnaire. Use fictional data. Policy changes after 16 Nov 2026 must be reviewed manually, especially publication of the Milburn Review and any government response. Check benefits-data.js rates before reusing next tax year.

OFFICIAL LINKS
https://www.gov.uk/health-conditions-disability-universal-credit/after-assessment
https://www.gov.uk/universal-credit/eligibility
https://www.gov.uk/pip/eligibility
https://www.gov.uk/government/publications/wca50-form-capability-for-work-questionnaire
https://www.gov.uk/government/news/90000-young-people-furthest-from-work-to-be-given-guaranteed-job-no-matter-where-they-live
https://www.citizensadvice.org.uk/benefits/
