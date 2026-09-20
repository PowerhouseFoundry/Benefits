POWERHOUSE BENEFITS APPLICATION SIMULATOR
=========================================

Purpose
-------
Training-only web app for West SILC Powerhouse learners aged 16-19. It helps learners practise the information, evidence and decisions involved in UK benefit applications without submitting a real claim.

IMPORTANT
---------
This is NOT a GOV.UK, DWP or council service. Do not enter real National Insurance numbers, bank details, passwords or detailed medical records. Practice answers are held only in memory for the current session and are not written to localStorage, Firestore or any other database.

Included training routes
------------------------
- Universal Credit: guided practice application, basic eligibility prompts and indicative monthly calculator
- Personal Independence Payment (PIP): 12 activity practice questions, points exercise and indicative rate calculator
- Carer's Allowance: main-criteria checker and indicative rate
- New Style ESA: contribution/health route checker and illustrative amount
- Housing Benefit: route checker for circumstances where new claims may still be relevant
- Council Tax Reduction: local-council route checker
- Access to Work: workplace-support route checker
- Attendance Allowance: later-life route checker
- Guided 'Find support' screen
- Evidence checklist
- Current rates and official-source links

NO DATABASE / NO FIREBASE
-------------------------
The simulator does not need Firebase, Firestore, authentication or any database.
It is a static site and can be hosted on Render.

Practice answers are deliberately not saved. Refreshing or closing the app resets the current session.

DATE AND RATE FUTURE-PROOFING
-----------------------------
The app now handles dates automatically:
- The footer uses the device's current year, so it will move from 2026 to 2027 automatically.
- The home screen only shows a benefit rate year while the configured rates are within their valid date range.
- After the configured rates expire, the home screen says "Update required" rather than presenting old figures as if they were current.
- The Rates & sources page clearly says which old rate year needs updating.

This is intentional. Benefit rates cannot safely be changed just by changing the year label because the actual amounts and some rules may change each April.

The central rates file is:
  benefits-data.js

It is currently configured for 2026/27 and is valid through 5 April 2027.

HOW TO UPDATE BENEFIT RATES EACH YEAR
-------------------------------------
1. Check the current official GOV.UK benefit rates and relevant guidance.
2. Open benefits-data.js.
3. Update rateYear, validFrom, validTo and lastReviewed.
4. Update only the values that have actually changed inside the UC, PIP, Carer's Allowance, ESA, Attendance Allowance and LHA sections.
5. Check/update the official source links in the sources section.
6. Test the calculators.
7. Push/redeploy the site on Render.

You no longer need to change a dated service-worker cache name. The service worker is network-first, so a new Render deployment is fetched when the device is online and the cached copy is used only as an offline fallback.

DEPLOY TO RENDER
----------------
This is a static site. No build process or server code is required.

Recommended Render Static Site settings:
- Build command: leave blank
- Publish directory: .

If the folder is stored inside a larger GitHub repository, set Render's root directory to this app folder first, then keep the publish directory as .

PWA / HOME-SCREEN APP
---------------------
The site includes manifest.webmanifest and service-worker.js. When served over HTTPS on Render, supported browsers can install it or add it to the home screen. It can also use the cached app as an offline fallback after it has been opened online once.

LOGO
----
assets/dwp-brand.png is the exact logo image supplied for the training mock-up. CSS uses object-fit: contain and its natural aspect ratio, so the app does not crop the image.

Files
-----
index.html               Main app shell
styles.css               Responsive visual design
benefits-data.js          Rates, PIP activity data and source URLs
app.js                    Navigation, forms and calculations (session-memory only)
manifest.webmanifest      Installable-app metadata
service-worker.js         Network-first/offline fallback cache
assets/app-icon.png       App icon
assets/dwp-brand.png      Supplied branding image, displayed uncropped
assets/dwp-reference-original.png  Earlier branding reference retained for comparison

Design / safeguarding notes
---------------------------
- Official-style branding is used only to make the internal training experience realistic.
- A prominent TRAINING SIMULATOR warning remains visible so the app cannot reasonably be mistaken for the real service.
- No real claim is submitted anywhere.
- No learner answers are transmitted or persisted by the app.
- Calculations are intentionally described as indicative because real entitlement can depend on rules and evidence not fully modelled by this training tool.
