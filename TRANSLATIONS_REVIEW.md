# FairShift – Translations & Native Linguistic Review

> **Context**: FairShift is designed for workers in employee-intensive environments (construction sites, college campuses, sanitation, security). Many workers have foundational literacy; therefore, translations prioritize clear, conversational phrasing over bureaucratic jargon.

## Review Table

| Language | Locale File | Dialect / Register Target | Native Review Status | Notes for Human Reviewers |
| :--- | :--- | :--- | :--- | :--- |
| **English** | `src/i18n/locales/en.json` | Indian English / Simple Plain English | **Validated** | 8th-grade reading level. Currency formatted in `₹`. |
| **Hindi** | `src/i18n/locales/hi.json` | Khari Boli / Conversational Hindustani | **Needs Native Review** | Used familiar terms like `पेस्लिप` (payslip) and `चेक इन` alongside Shuddh Hindi. Check phrasing for "Provident Fund" and "Overtime". |
| **Tamil** | `src/i18n/locales/ta.json` | Tamil Nadu Standard Colloquial | **Needs Native Review** | Avoided high-register classical Tamil; terms like `செக்-இன்` and `சம்பள சீட்டு` used to ensure workers understand immediately. |
| **Telugu** | `src/i18n/locales/te.json` | Standard Andhra/Telangana Common | **Needs Native Review** | `పేస్లిప్` and `చెక్ ఇన్` kept in phonetic Telugu for accessibility on field devices. |
| **Kannada** | `src/i18n/locales/kn.json` | Karnataka Common Register | **Needs Native Review** | Focus on clarity for industrial and campus maintenance staff in Bengaluru/Mysuru regions. |
| **Malayalam** | `src/i18n/locales/ml.json` | Kerala Common Register | **Needs Native Review** | Check terms for safety hazards and overtime multipliers. |

---

## Strings Specifically Flagged for In-Field Testing

1. **`payslip.deductions`**:
   - `pf_desc`: *"Government retirement savings (12% of basic pay)"*
   - Verify that non-English speakers recognize PF as a benefit rather than a penalty.
2. **`feedback.subtitle`**:
   - *"Your identity is never shared with your employer"*
   - Critical trust vector: Ensure native phrasing conveys absolute anonymity without ambiguous legalistic disclaimers.
3. **`hazard.severity_critical`**:
   - *"Critical – immediate danger to life"*
   - Must be instantly recognizable with high visual urgency even if read aloud or glanced at quickly.

---

## Audio Speech Synthesis Mapping

For the speech read-aloud feature (`window.speechSynthesis`), FairShift maps to native BCP-47 locale tags:
- Hindi: `hi-IN`
- Tamil: `ta-IN`
- Telugu: `te-IN`
- Kannada: `kn-IN`
- Malayalam: `ml-IN`
- English: `en-IN`

A slower speech rate of `0.9x` is applied by default to ensure ease of comprehension over noisy workplace backgrounds.
