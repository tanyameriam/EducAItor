Got it — I’ll create a **developer-ready PRD** for your 22-screen post-submission system.

This will be:

* Structured (so devs understand system architecture)
* Actionable (what to build, not just concepts)
* Mapped to screens (clear implementation path)

---

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD/TEST***)

## Module 2 — Post Submission System (Phase 3 → 8)

---

# 1. 🧠 PRODUCT OVERVIEW

## 1.1 Objective

Build an **AI-assisted instructor grading system** where:

* AI evaluates submissions (background)
* Instructor supervises, overrides, and approves
* System generates feedback, handles appeals, and maintains audit

---

## 1.2 Core Principle

> Instructor is always the final authority.
> AI = suggestion layer, not decision layer.

---

## 1.3 Key Capabilities

| Capability    | Description                                  |
| ------------- | -------------------------------------------- |
| AI Evaluation | Extract evidence + assign score + confidence |
| Supervision   | Instructor reviews + overrides               |
| Feedback      | AI-generated + instructor-approved           |
| Appeals       | Structured dispute handling                  |
| Learning Loop | Improve rubric based on overrides            |
| Audit         | Full traceability for compliance             |

---

# 2. 👤 PRIMARY USER

## Instructor (Tier 2/3 colleges)

* Medium tech familiarity
* Works on unstable internet
* Handles 60–200 submissions per batch
* Needs speed + trust + control

---

# 3. 🧩 SYSTEM ARCHITECTURE (SIMPLIFIED)

```id="arch1"
Module 1 → Validated Submissions
      ↓
Phase 3 → AI Evaluation Engine
      ↓
Supervision (Core UI)
      ↓
Feedback Engine
      ↓
Appeals System
      ↓
Learning + Audit Systems
```

---

# 4. 🔁 USER FLOW SUMMARY

```id="flow"
Dashboard
→ Evaluation Progress
→ Grading Desk (Batch)
→ Triage
→ Submission Detail
→ Override / Approve
→ Feedback Review
→ Release
→ Appeals
→ Learning Insights
→ Audit
```

---

# 5. 🧱 SCREEN-BY-SCREEN PRD

---

## 🔵 SCREEN 0: ASSIGNMENT DASHBOARD

### Purpose

Entry point into post-submission workflow

### Features

* Submission count
* Evaluation status
* Progress indicator

### Data Required

* assignment_id
* total_submissions
* evaluation_status
* processed_count

### Actions

* View progress
* Enter grading desk

---

## 🟡 SCREEN 1: EVALUATION PROGRESS

### Purpose

Show AI processing status

### Features

* % completion
* Time estimate
* Flags preview

### Backend Logic

* Batch processing queue
* Status polling (every 5–10 sec)

---

## 🔵 SCREEN 2: BATCH VIEW (GRADING DESK)

### Purpose

Main control center

### Features

* Table of submissions
* Filters:

  * Confidence
  * Flags
  * Status

### Data Model

```id="data1"
Submission {
  id
  student_name
  score
  confidence
  status
  flags[]
}
```

### Actions

* Open submission
* Batch select
* Apply filters

---

## 🔵 SCREEN 3: CONFIDENCE TRIAGE

### Purpose

Prioritize instructor attention

### Logic

Sort submissions:

```id="logic1"
Minimal → Weak → Partial → Strong
```

### UI Behavior

* Color-coded confidence
* Auto-focus low confidence

---

## 🔵 SCREEN 4: SUBMISSION DETAIL (CORE SCREEN)

### Purpose

Primary grading interface

---

### Layout

**Left Panel**

* Original file (PDF/Image)
* Toggle: OCR / Original

**Right Panel**

* Criteria list:

  * Score
  * Confidence
  * Evidence (10–25 words)

---

### Data Model

```id="data2"
Criterion {
  id
  score
  confidence
  evidence
  rationale
}
```

---

### Actions

* Override
* Approve
* Navigate next

---

## 🔵 SCREEN 5: CRITERION DETAIL

### Purpose

Deep inspection

### Features

* Full rubric
* AI reasoning
* Evidence mapping

---

## 🔴 SCREEN 6: OVERRIDE MODAL (CRITICAL)

### Purpose

Capture instructor correction

---

### Inputs

```id="data3"
Override {
  submission_id
  criterion_id
  old_score
  new_score
  reason
  note
}
```

---

### Reason Options

* OCR error
* Evidence missed
* Interpretation difference
* Benefit of doubt
* Other

---

### Rules

* Reason = mandatory
* Save = blocked if empty

---

## 🔵 SCREEN 7: SUBMISSION ACTION

### Purpose

Finalize per submission

### Actions

* Approve & Next
* Save & Exit
* Mark for review

---

## 🔵 SCREEN 8: BATCH ACTION PANEL

### Purpose

Bulk operations

### Features

* Multi-select submissions
* Apply same action

### Rules

* Each submission logged individually

---

## 🔵 SCREEN 9: RESUME SESSION

### Purpose

Session persistence

### Features

* Last position
* Progress %

### Logic

Auto-save after:

* Override
* Approval
* Navigation

---

# 🟢 FEEDBACK PHASE

---

## 🟢 SCREEN 10: FEEDBACK BATCH VIEW

### Features

* Feedback preview per student

### Structure

```id="data4"
Feedback {
  strengths[2]
  gaps[3]
  improvements[3]
}
```

---

## 🟢 SCREEN 11: FEEDBACK EDITOR

### Features

* Inline editing
* Tone selector
* Add note

---

## 🟢 SCREEN 12: RELEASE CONTROL

### Features

* Schedule release
* Manual release

---

# 🟠 APPEALS

---

## 🟠 SCREEN 13: APPEALS INBOX

### Features

* Appeal list
* AI triage label

---

## 🟠 SCREEN 14: APPEAL REVIEW

### Features

* Student argument
* Evidence comparison

### Actions

* Uphold
* Reject
* Partial

---

## 🟠 SCREEN 15: RE-EVALUATION

### Features

* Old vs new score comparison

---

# 🟡 LEARNING LOOP

---

## 🟡 SCREEN 16: ANALYTICS DASHBOARD

### Metrics

* Override rate
* Confidence mismatch
* Score distribution

---

## 🟡 SCREEN 17: SUGGESTION PANEL

### Features

* Suggested rubric improvements

---

# 🔴 SCALE SYSTEM

---

## 🔴 SCREEN 18: PATTERN DETECTION

### Features

* Group similar submissions

---

# ⚫ AUDIT SYSTEM

---

## ⚫ SCREEN 19: AUDIT LOG

### Data

```id="data5"
Audit {
  submission_id
  action
  timestamp
  user
}
```

---

## ⚫ SCREEN 20: BIAS DETECTION

### Features

* Section comparison
* Distribution charts

---

## ⚫ SCREEN 21: REPLAY EVALUATION

### Purpose

Verify deterministic output

---

## ⚫ SCREEN 22: COMPLIANCE EXPORT

### Features

* DPDP logs
* Accreditation reports

---

# 6. ⚙️ CORE SYSTEM LOGIC

---

## 6.1 Confidence Calculation

```id="logic2"
Base Confidence:
Strong = 0.95
Clear = 0.90
Partial = 0.80
Weak = 0.70
Minimal = 0.60

Adjustments:
OCR → -0.1
Overlap → -0.05
```

---

## 6.2 Evaluation Rules

* One criterion = one score
* No evidence = lowest score
* Deterministic output

---

## 6.3 Override Rules

* Mandatory reason
* Stored permanently
* Used for learning loop

---

# 7. ⚠️ ERROR HANDLING

---

## Network Drop

* Auto-save state
* Resume exact screen

## OCR Failure

* Force original image view

## AI Wrong High Confidence

* Allow override + flag

## Missing Data

* Show fallback state

---

# 8. 📊 SUCCESS METRICS

| Metric                  | Target  |
| ----------------------- | ------- |
| Time per submission     | < 2 min |
| Override rate           | 10–15%  |
| Completion rate         | 95%     |
| Instructor satisfaction | >4/5    |

---

# 9. 🚨 NON-NEGOTIABLE REQUIREMENTS

* Evidence must be shown (10–25 words)
* Override must have reason
* System must be deterministic
* Auto-save must exist
* Original submission always visible

---

# 10. 🧠 DEV IMPLEMENTATION PRIORITY

Build in this order:

### Phase 1 (MVP Core)

1. Batch View
2. Submission Detail
3. Override Modal
4. Approval Flow

---

### Phase 2

5. Feedback System
6. Appeals

---

### Phase 3

7. Analytics
8. Audit

---

# 🚀 FINAL NOTE (IMPORTANT FOR YOUR DEV)

This is NOT just CRUD screens.

This is:

👉 A **decision-support system**

So dev must focus on:

* Speed (fast navigation)
* State management (resume, save)
* Data integrity (audit logs)
* Side-by-side rendering (core complexity)

---
