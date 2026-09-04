# Architectural & Domain Assumptions: Kids Arabic Academy

This document tracks all explicit assumptions made during development based on `PROJECT_BRIEF.md` and `CHATGPT.md`.

## 1. User & Identity Assumptions
- **Child Self-Registration**: Children aged 4-16 do not register independently. Only verified parents/guardians or school administrators can create student accounts.
- **Child Contact Details**: Children do not have personal phone numbers or public emails stored. Notifications and alerts go directly to the verified parent.
- **Family Multi-Child Support**: A single parent account can have multiple children enrolled across different programs, levels, and schedules. The parent UI includes a child switcher.
- **Age Categorization**: The curriculum and UI adaptations reflect four pedagogical age brackets:
  1. `4-6 Years`: Little Sprouts (playful audio-visual UI, phonics, alphabet sounds).
  2. `7-10 Years`: Junior Explorers (gamified stories, handwriting, basic Tajweed).
  3. `11-13 Years`: Intermediate Navigators (structured grammar, conversation, reading comprehension).
  4. `14-16 Years`: Young Scholars (advanced literature, public speaking, in-depth Quranic sciences).

## 2. Academic & Pedagogical Assumptions
- **Programs**: Seven primary educational tracks:
  1. Arabic Foundations (Alphabet Recognition, Letter Sounds, Vocabulary Building, Reading Practice)
  2. Reading Program (Phonics, Reading Fluency, Reading Comprehension, Story-Based Learning)
  3. Writing Program (Handwriting, Sentence Formation, Creative Writing, Grammar Practice)
  4. Speaking Program (Pronunciation, Conversation Practice, Public Speaking)
  5. Listening Program (Story Listening, Audio Exercises, Interactive Comprehension)
  6. Quran Program (Quran Reading, Memorization, Tajweed, Revision)
  7. Islamic Studies (Basic Islamic Knowledge, Prophetic Stories, Islamic Values)
- **Class Group Sizing**: For high pedagogical quality with young language learners, default class group capacity is capped at 6 students for group classes. Private lessons are 1-on-1.

## 3. Financial & Billing Assumptions
- **Minor Units**: All monetary values are represented as integer minor units (`amountMinorUnits`) with 3-letter ISO-4217 currency codes (e.g. `EUR`, `USD`, `SAR`).
- **Subscription Plans**:
  - `Individual Plan`: Single child enrollment.
  - `Family Plan`: Sibling discount / multi-child bundled enrollment.
  - `Group Classes`: Small cohort sessions (up to 6 students).
  - `Private Lessons`: Dedicated 1-on-1 instruction.
- **Supported Payment Gateways**: Abstraction layer supporting Stripe, PayPal, Mollie, Apple Pay, Google Pay, and development Mock.
- **Teacher Compensation**: Calculated based on verified completed sessions (`COMPLETED` status) multiplied by the teacher's contracted hourly rate, plus performance bonuses.

## 4. Scheduling & Timezones
- **Storage Standard**: All session schedules and timestamps are stored in UTC.
- **Display Standard**: All interfaces convert UTC into the user's local IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- **Conflict Management**: Overlapping sessions for the same teacher or student are flagged during class creation and enrollment.

## 5. Localization & Languages
- **Primary**: Arabic (`ar`) with complete Right-to-Left (RTL) layout.
- **Secondary**: English (`en`) with Left-to-Right (LTR).
- **Target Expansions**: Dutch (`nl`), Turkish (`tr`), Italian (`it`), Spanish (`es`).
