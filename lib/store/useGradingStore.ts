import { create } from 'zustand';

// ─── NEW INTERFACES FOR MULTI-ASSIGNMENT ───────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  code: string;
  semester: string;
}

export interface Section {
  id: string;
  name: string;
  courseId: string;
  studentCount: number;
}

export interface Assignment {
  id: string;
  title: string;
  type: 'Essay' | 'Report' | 'Proposal' | 'Documentation' | 'Presentation';
  courseId: string;
  sectionIds: string[]; // Support multiple sections
  rubricSnapshot: RubricSnapshot; // Immutable rubric at time of creation
  totalSubmissions: number;
  status: 'draft' | 'evaluating' | 'grading' | 'completed';
  dueDate: string;
  createdAt: string;
  evaluationProgress: number; // 0-100
}

export interface RubricSnapshot {
  id: string;
  criteria: RubricCriterion[];
  totalPoints: number;
  version: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  maxScore: number;
  description: string;
}

// ─── EXISTING INTERFACES (UPDATED) ─────────────────────────────────────────────

export interface OverrideRecord {
  criterionId: string;
  criterionTitle: string;
  originalScore: number;
  newScore: number;
  reasonCode: 'ocr' | 'missed' | 'interpretation' | 'benefit';
  reasonLabel: string;
  instructorId: string;
  timestamp: string;
}

export interface AntiCheatingFlags {
  flagged: boolean;
  similarityScore: number;
  similarSubmissionId?: string;
}

export interface ReleaseSchedule {
  type: 'immediate' | 'scheduled' | 'manual';
  scheduledAt?: string;
}

export interface SessionState {
  lastOpenedSubmissionId: string | null;
  savedAt: string | null;
  assignmentId: string | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetSubmissionId: string;
  targetLabel: string;
  details: string;
  actionColor: 'warning' | 'success' | 'danger' | 'default' | 'accent';
  assignmentId: string;
}

export interface Criterion {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  originalAiScore: number;
  confidence: string;
  confidenceColor: "success" | "warning" | "danger" | "accent" | "default";
  evidence: string;
  rationale: string;
  isOverridden?: boolean;
  overrideHistory: OverrideRecord[];
}

export interface Feedback {
  strengths: string[];
  gaps: string[];
  improvements: string[];
  tone: "Constructive" | "Direct" | "Encouraging";
  isReleased: boolean;
  releaseSchedule: ReleaseSchedule;
  // FeedbackStudio additions
  suggestions?: string[];
  overallSummary?: string;
  personalNote?: string;
  highlights?: TextHighlight[];
  linkedEvidence?: EvidenceLink[];
}

export interface TextHighlight {
  id: string;
  startOffset: number;
  endOffset: number;
  text: string;
  color: 'yellow' | 'green' | 'red' | 'blue';
  linkedFeedbackId?: string;
}

export interface EvidenceLink {
  id: string;
  highlightId: string;
  feedbackType: 'strength' | 'gap' | 'improvement' | 'suggestion';
  feedbackIndex: number;
  rationale: string;
}

export interface GenerationParams {
  tone: 'Supportive' | 'Direct' | 'Motivational' | 'Socratic';
  length: 'Brief' | 'Standard' | 'Detailed';
  style: 'Paragraphs' | 'Bullet points' | 'Mixed';
  suggestions: 'None' | 'Struggling students only' | 'All students';
  improvementTips: 'Embedded' | 'Separate section' | 'None';
  standards: 'CEFR' | 'IELTS' | 'None';
}

export interface Appeal {
  id: string;
  status: "Pending" | "Reviewed" | "Resolved";
  studentArgument: string;
  date: string;
  aiTriage: 'Likely Valid' | 'Unlikely Valid' | 'Needs Instructor Review';
  criterionDisputed: string;
  resolution?: 'Uphold' | 'Reject' | 'Partial';
}

export interface Submission {
  id: string;
  assignmentId: string; // NEW: Link to assignment
  paperId: string;
  studentName: string;
  submittedAt: string;
  status: "Evaluating" | "Needs Review" | "Approved";
  criteria: Criterion[];
  feedback?: Feedback;
  appeal?: Appeal;
  antiCheatingFlags: AntiCheatingFlags;
  ocrContent: string;
  scenarioTag: string;
  // FeedbackStudio additions
  feedbackGenerationState?: 'not_started' | 'configuring' | 'generating' | 'generated' | 'approved';
  generationParams?: GenerationParams;
  approvedFeedback?: Feedback | null; // Snapshot of approved feedback
}

// ─── STORE INTERFACE ──────────────────────────────────────────────────────────

export interface RefinementVariant {
  id: string;
  name: string;
  description: string;
  transform: (feedback: Feedback) => Feedback;
}

export interface GradingStore {
  // Multi-assignment entities
  courses: Record<string, Course>;
  sections: Record<string, Section>;
  assignments: Record<string, Assignment>;
  submissions: Record<string, Submission>;
  
  // Current context
  currentAssignmentId: string | null;
  sessionState: SessionState;
  auditLog: AuditLogEntry[];

  // Getters
  getAssignmentList: () => Assignment[];
  getCurrentAssignment: () => Assignment | null;
  getSubmissionsForAssignment: (assignmentId: string) => Submission[];
  getProcessedCount: (assignmentId?: string) => number;
  getSubmissionList: (assignmentId?: string) => Submission[];
  getCourses: () => Course[];
  getSectionsForCourse: (courseId: string) => Section[];
  getAggregatedStats: () => AggregatedStats;
  getAppealsForAssignment: (assignmentId?: string) => Submission[];
  getRefinementVariants: () => RefinementVariant[];

  // Actions
  setCurrentAssignment: (assignmentId: string | null) => void;
  overrideScore: (
    submissionId: string,
    criterionId: string,
    newScore: number,
    reasonCode: OverrideRecord['reasonCode'],
    instructorId: string
  ) => void;
  approveSubmission: (submissionId: string) => void;
  bulkApproveSubmissions: (submissionIds: string[]) => void;
  updateFeedbackTone: (submissionId: string, tone: Feedback["tone"]) => void;
  updateFeedbackText: (
    submissionId: string,
    type: "strengths" | "gaps" | "improvements" | "suggestions",
    index: number,
    text: string
  ) => void;
  updateOverallSummary: (submissionId: string, summary: string) => void;
  updatePersonalNote: (submissionId: string, note: string) => void;
  releaseFeedback: (submissionId: string) => void;
  scheduleFeedbackRelease: (submissionId: string, schedule: ReleaseSchedule) => void;
  resolveAppeal: (submissionId: string, resolution: "Uphold" | "Reject" | "Partial") => void;
  setSessionState: (partial: Partial<SessionState>) => void;
  // FeedbackStudio actions
  startFeedbackGeneration: (submissionId: string, params: GenerationParams) => void;
  generateFeedback: (submissionId: string) => void;
  applyRefinement: (submissionId: string, variantId: string) => void;
  addHighlight: (submissionId: string, highlight: Omit<TextHighlight, 'id'>) => void;
  removeHighlight: (submissionId: string, highlightId: string) => void;
  linkEvidence: (submissionId: string, link: Omit<EvidenceLink, 'id'>) => void;
  unlinkEvidence: (submissionId: string, linkId: string) => void;
  approveFeedback: (submissionId: string) => void;
}

export interface AggregatedStats {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  totalSubmissions: number;
  processedSubmissions: number;
  pendingAppeals: number;
  averageOverrideRate: number;
  assignmentsByStatus: Record<string, number>;
}

// ─── REASON LABELS ─────────────────────────────────────────────────────────────

const REASON_LABELS: Record<OverrideRecord['reasonCode'], string> = {
  ocr: 'OCR / Handwriting Illegible',
  missed: 'Evidence Missed by AI Engine',
  interpretation: 'Differing Interpretation of Rubric',
  benefit: 'Benefit of the Doubt',
};

// ─── MOCK DATA: COURSES ────────────────────────────────────────────────────────

const MOCK_COURSES: Record<string, Course> = {
  'ENG-TE-MECH': {
    id: 'ENG-TE-MECH',
    name: 'Technical English — Mechanical',
    code: 'ENG-TE-MECH',
    semester: 'Sem 1 · AY 2025–26',
  },
  'ENG-TE-IT': {
    id: 'ENG-TE-IT',
    name: 'Technical English — Information Technology',
    code: 'ENG-TE-IT',
    semester: 'Sem 1 · AY 2025–26',
  },
  'ENG-TE-CIVIL': {
    id: 'ENG-TE-CIVIL',
    name: 'Technical English — Civil Engineering',
    code: 'ENG-TE-CIVIL',
    semester: 'Sem 1 · AY 2025–26',
  },
  'ENG-BC-MECH': {
    id: 'ENG-BC-MECH',
    name: 'Business Communication — Mechanical',
    code: 'ENG-BC-MECH',
    semester: 'Sem 3 · AY 2025–26',
  },
  'ENG-BC-IT': {
    id: 'ENG-BC-IT',
    name: 'Business Communication — Information Technology',
    code: 'ENG-BC-IT',
    semester: 'Sem 3 · AY 2025–26',
  },
  'ENG-BC-CIVIL': {
    id: 'ENG-BC-CIVIL',
    name: 'Business Communication — Civil Engineering',
    code: 'ENG-BC-CIVIL',
    semester: 'Sem 3 · AY 2025–26',
  },
};

// ─── MOCK DATA: SECTIONS ───────────────────────────────────────────────────────

const MOCK_SECTIONS: Record<string, Section> = {
  'ENG-TE-MECH-A': { id: 'ENG-TE-MECH-A', name: 'Section A (Morning Batch)', courseId: 'ENG-TE-MECH', studentCount: 45 },
  'ENG-TE-MECH-B': { id: 'ENG-TE-MECH-B', name: 'Section B (Afternoon Batch)', courseId: 'ENG-TE-MECH', studentCount: 45 },
  'ENG-TE-IT-A':   { id: 'ENG-TE-IT-A',   name: 'Section A (Morning Batch)', courseId: 'ENG-TE-IT',   studentCount: 50 },
  'ENG-TE-IT-B':   { id: 'ENG-TE-IT-B',   name: 'Section B (Afternoon Batch)', courseId: 'ENG-TE-IT',   studentCount: 50 },
  'ENG-TE-CIVIL-A':{ id: 'ENG-TE-CIVIL-A',name: 'Section A (Morning Batch)', courseId: 'ENG-TE-CIVIL', studentCount: 40 },
  'ENG-TE-CIVIL-B':{ id: 'ENG-TE-CIVIL-B',name: 'Section B (Afternoon Batch)', courseId: 'ENG-TE-CIVIL', studentCount: 40 },
  'ENG-BC-MECH-A': { id: 'ENG-BC-MECH-A', name: 'Section A (Morning Batch)', courseId: 'ENG-BC-MECH', studentCount: 43 },
  'ENG-BC-MECH-B': { id: 'ENG-BC-MECH-B', name: 'Section B (Afternoon Batch)', courseId: 'ENG-BC-MECH', studentCount: 42 },
  'ENG-BC-IT-A':   { id: 'ENG-BC-IT-A',   name: 'Section A (Morning Batch)', courseId: 'ENG-BC-IT',   studentCount: 48 },
  'ENG-BC-IT-B':   { id: 'ENG-BC-IT-B',   name: 'Section B (Afternoon Batch)', courseId: 'ENG-BC-IT',   studentCount: 47 },
  'ENG-BC-CIVIL-A':{ id: 'ENG-BC-CIVIL-A',name: 'Section A (Morning Batch)', courseId: 'ENG-BC-CIVIL', studentCount: 38 },
  'ENG-BC-CIVIL-B':{ id: 'ENG-BC-CIVIL-B',name: 'Section B (Afternoon Batch)', courseId: 'ENG-BC-CIVIL', studentCount: 37 },
};

// ─── MOCK DATA: RUBRIC SNAPSHOTS ───────────────────────────────────────────────
// All English courses share the same 4-criterion schema. Each assignment gets
// its own snapshot instance to preserve rubric immutability semantics.

const ENGLISH_RUBRIC_CRITERIA = [
  {
    id: 'c1',
    title: 'Grammar & Sentence Structure',
    maxScore: 5,
    description: 'Grammatical accuracy across all sentences; correct tense consistency; appropriate sentence variety (simple, compound, complex). Penalise subject-verb errors, tense confusion, and run-on sentences.',
  },
  {
    id: 'c2',
    title: 'Vocabulary & Word Choice',
    maxScore: 5,
    description: 'Appropriate register for the genre (formal for reports/proposals, semi-formal for emails); precise word choices; avoidance of repetition and vague language. Reward domain-appropriate terminology used correctly.',
  },
  {
    id: 'c3',
    title: 'Coherence & Organisation',
    maxScore: 5,
    description: 'Logical paragraph sequencing; clear topic sentences; use of cohesive devices (connectives, pronouns, reference chains); ideas grouped meaningfully with smooth transitions.',
  },
  {
    id: 'c4',
    title: 'Tone, Format & Task Fulfilment',
    maxScore: 5,
    description: 'Correct tone for the assigned genre (formal/semi-formal/instructional); expected format conventions observed; task prompt fully addressed with no major omissions.',
  },
];

const ENGLISH_RUBRIC_TE_MECH:  RubricSnapshot = { id: 'rubric-te-mech-001',  version: '1.0', totalPoints: 20, criteria: ENGLISH_RUBRIC_CRITERIA };
const ENGLISH_RUBRIC_TE_IT:    RubricSnapshot = { id: 'rubric-te-it-001',    version: '1.0', totalPoints: 20, criteria: ENGLISH_RUBRIC_CRITERIA };
const ENGLISH_RUBRIC_TE_CIVIL: RubricSnapshot = { id: 'rubric-te-civil-001', version: '1.0', totalPoints: 20, criteria: ENGLISH_RUBRIC_CRITERIA };
const ENGLISH_RUBRIC_BC_MECH:  RubricSnapshot = { id: 'rubric-bc-mech-001',  version: '1.0', totalPoints: 20, criteria: ENGLISH_RUBRIC_CRITERIA };
const ENGLISH_RUBRIC_BC_CIVIL: RubricSnapshot = { id: 'rubric-bc-civil-001', version: '1.0', totalPoints: 20, criteria: ENGLISH_RUBRIC_CRITERIA };

// ─── MOCK DATA: ASSIGNMENTS ────────────────────────────────────────────────────

const MOCK_ASSIGNMENTS: Record<string, Assignment> = {
  'TE-MECH-ESSAY': {
    id: 'TE-MECH-ESSAY',
    title: 'Essay: Describe a Technical Process',
    type: 'Essay',
    courseId: 'ENG-TE-MECH',
    sectionIds: ['ENG-TE-MECH-A', 'ENG-TE-MECH-B'],
    rubricSnapshot: ENGLISH_RUBRIC_TE_MECH,
    totalSubmissions: 90,
    status: 'grading',
    dueDate: '2026-04-10',
    createdAt: '2026-03-15',
    evaluationProgress: 78,
  },
  'TE-IT-REPORT': {
    id: 'TE-IT-REPORT',
    title: 'Report: Laboratory Observation Notes',
    type: 'Report',
    courseId: 'ENG-TE-IT',
    sectionIds: ['ENG-TE-IT-A', 'ENG-TE-IT-B'],
    rubricSnapshot: ENGLISH_RUBRIC_TE_IT,
    totalSubmissions: 100,
    status: 'grading',
    dueDate: '2026-04-12',
    createdAt: '2026-03-18',
    evaluationProgress: 62,
  },
  'TE-CIVIL-HOW-TO': {
    id: 'TE-CIVIL-HOW-TO',
    title: 'Instructions: Step-by-Step How-To Guide',
    type: 'Documentation',
    courseId: 'ENG-TE-CIVIL',
    sectionIds: ['ENG-TE-CIVIL-A', 'ENG-TE-CIVIL-B'],
    rubricSnapshot: ENGLISH_RUBRIC_TE_CIVIL,
    totalSubmissions: 80,
    status: 'completed',
    dueDate: '2026-03-28',
    createdAt: '2026-03-05',
    evaluationProgress: 100,
  },
  'BC-MECH-PROPOSAL': {
    id: 'BC-MECH-PROPOSAL',
    title: 'Proposal: Business Problem & Solution',
    type: 'Proposal',
    courseId: 'ENG-BC-MECH',
    sectionIds: ['ENG-BC-MECH-A', 'ENG-BC-MECH-B'],
    rubricSnapshot: ENGLISH_RUBRIC_BC_MECH,
    totalSubmissions: 85,
    status: 'grading',
    dueDate: '2026-04-15',
    createdAt: '2026-03-22',
    evaluationProgress: 41,
  },
  'BC-CIVIL-EMAIL': {
    id: 'BC-CIVIL-EMAIL',
    title: 'Email: Professional Correspondence Scenario',
    type: 'Essay',
    courseId: 'ENG-BC-CIVIL',
    sectionIds: ['ENG-BC-CIVIL-A', 'ENG-BC-CIVIL-B'],
    rubricSnapshot: ENGLISH_RUBRIC_BC_CIVIL,
    totalSubmissions: 75,
    status: 'completed',
    dueDate: '2026-03-30',
    createdAt: '2026-03-08',
    evaluationProgress: 100,
  },
};

// ─── MOCK DATA: SUBMISSIONS ─────────────────────────────────────────────────────

const MOCK_SUBMISSIONS: Record<string, Submission> = {
  // sub-1: Arjun Mehta — Essay on how a hydraulic jack works
  "sub-1": {
    id: "sub-1",
    assignmentId: 'TE-MECH-ESSAY',
    paperId: "MECH-A-047",
    studentName: "Arjun Mehta",
    submittedAt: "2 hours ago",
    status: "Needs Review",
    scenarioTag: "S1 — Standard Batch, High Confidence",
    antiCheatingFlags: { flagged: false, similarityScore: 0 },
    ocrContent: `ESSAY: DESCRIBE A TECHNICAL PROCESS
Student: Arjun Mehta | Roll No: 2025MECH-A-047 | Paper ID: MECH-A-047
Course: Technical English — Mechanical (Section A)

TITLE: HOW A HYDRAULIC JACK WORKS

A hydraulic jack is a device which is used to lift heavy objects, such as vehicles
or machinery, using the principle of Pascal's Law. The process of lifting begins
when the operator exerts a downward force on the handle.

When the handle is pushed down, it moves a small piston inside a cylinder. This
creates pressure in the hydraulic fluid — usually oil — which fills the cylinder.
According to Pascal's Law, this pressure is transmitted equally in all directions
throughout the fluid. The fluid then pushes against a larger piston, causing it to
move upward with a much greater force than was originally applied.

The ratio of the areas of the two pistons determines the mechanical advantage. A
small force applied over a small area can therefore produce a large force over a
larger area. This is why a person can lift a car using relatively little effort.

To lower the object, the operator opens a release valve. This allows the hydraulic
fluid to flow back into the reservoir, and the larger piston descends under the
weight of the load.

The hydraulic jack is a useful example of how engineering principles can be
explained in simple, clear language. It show that even complex mechanisms can be
described in a step-by-step manner that any reader can follow.`,
    criteria: [
      {
        id: "c1",
        title: "Grammar & Sentence Structure",
        score: 4, maxScore: 5, originalAiScore: 4,
        confidence: "Strong", confidenceColor: "success",
        evidence: "One subject-verb agreement error: \"It show that even complex mechanisms\" — should be \"It shows\"",
        rationale: "Overall grammar is accurate and varied. Sentences demonstrate good complexity with appropriate use of relative clauses and passive constructions. One minor error in the final paragraph detected: \"It show\" should be \"It shows\". Consistent past/present tense handling throughout.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c2",
        title: "Vocabulary & Word Choice",
        score: 3, maxScore: 5, originalAiScore: 3,
        confidence: "Strong", confidenceColor: "success",
        evidence: "\"useful\", \"simple\", \"clear\" — generic modifiers repeated; no synonyms attempted; domain terms used correctly but sparingly",
        rationale: "Student uses technical terms such as \"Pascal's Law\", \"hydraulic fluid\", \"mechanical advantage\" correctly, which is good. However, descriptive vocabulary is limited and repetitive. Words like \"useful\", \"simple\", and \"clear\" appear without variety. Greater precision and range in modifiers would strengthen this essay considerably.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c3",
        title: "Coherence & Organisation",
        score: 4, maxScore: 5, originalAiScore: 4,
        confidence: "Strong", confidenceColor: "success",
        evidence: "Step-by-step sequence followed; each paragraph introduces a clear stage; transition words (\"then\", \"therefore\") used appropriately",
        rationale: "The essay follows a clear process-description structure: introduction → handle action → pressure transmission → mechanical advantage → release → conclusion. Flow is logical. The conclusion is slightly abrupt and does not effectively close the technical description.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c4",
        title: "Tone, Format & Task Fulfilment",
        score: 5, maxScore: 5, originalAiScore: 5,
        confidence: "Strong", confidenceColor: "success",
        evidence: "Formal essay tone maintained throughout; title present; task prompt (describe a technical process) fully addressed from start to end",
        rationale: "Student has correctly identified the task as an expository essay and maintained a formal, informative tone throughout. No first-person casual register. Title provided. The process is described from initiation through to release, fulfilling the task prompt completely.",
        isOverridden: false, overrideHistory: [],
      },
    ],
    feedback: {
      strengths: [
        "Strong command of formal essay tone and technical subject matter — the explanation of Pascal's Law and mechanical advantage is accurate and clearly expressed.",
        "Logical process structure with appropriate use of sequence connectives (\"then\", \"therefore\") that guide the reader through each stage of the hydraulic jack operation.",
      ],
      gaps: [
        "Vocabulary range is limited — descriptive adjectives are generic and repeated (\"useful\", \"simple\", \"clear\") without variety or precision.",
        "One grammar error in the final paragraph (\"It show that…\") undermines an otherwise accurate submission.",
      ],
      improvements: [
        "Expand your vocabulary bank by practising synonyms for common adjectives — instead of \"useful\", try \"practical\", \"efficient\", or \"indispensable\" depending on the context.",
        "Proofread specifically for subject-verb agreement in the final draft stage, particularly with singular subjects followed by relative clauses.",
        "Strengthen the conclusion by summarising the entire process in 1–2 sentences rather than shifting to a general observation about engineering communication.",
      ],
      tone: "Constructive",
      isReleased: false,
      releaseSchedule: { type: 'manual' },
    },
  },

  // sub-2: Kavitha Nair — Lab Observation Notes, OCR partial failure in Section 4
  "sub-2": {
    id: "sub-2",
    assignmentId: 'TE-IT-REPORT',
    paperId: "IT-B-023",
    studentName: "Kavitha Nair",
    submittedAt: "4 hours ago",
    status: "Needs Review",
    scenarioTag: "S3 — OCR Misread Override",
    antiCheatingFlags: { flagged: false, similarityScore: 0 },
    ocrContent: `LABORATORY OBSERVATION REPORT
Student: Kavitha Nair | Roll No: 2025IT-B-023 | Paper ID: IT-B-023
Course: Technical English — Information Technology (Section B)

TITLE: OBSERVATION NOTES — NETWORK SETUP LAB SESSION

DATE OF OBSERVATION: 15 March 2026
LOCATION: IT Lab 3, Block C

1. INTRODUCTION
This report documents my observations during a practical session in the IT Laboratory. The
purpose of the session was to set up a basic local area network (LAN) connecting five
computers using a switch and Ethernet cables.

2. EQUIPMENT OBSERVED
The following equipment was present and used during the session:
- One 8-port network switch (unmanaged)
- Five desktop computers with Windows 10
- Five Cat-6 Ethernet cables (2 metres each)
- One laptop for monitoring traffic using Wireshark

3. PROCEDURE OBSERVED
The demonstrator first connected each computer to the switch using the Ethernet cables. After
all five connections were established, the IP addresses were configured manually on each
machine. The subnet mask was set to 255.255.255.0 for all devices.

4. OBSERVATIONS
[Handwritten section — OCR partial failure. Text in this section is smudged near the binding margin.]
...ping test was conducted... response time... [unreadable segment approx. 4 lines]
...no packet loss... connection was stable.

5. CONCLUSION
The laboratory session demonstrated the process of setting up a LAN successfully. The
equipment functioned as expected and the network was established without significant errors.`,
    criteria: [
      {
        id: "c1",
        title: "Grammar & Sentence Structure",
        score: 2, maxScore: 5, originalAiScore: 2,
        confidence: "Weak", confidenceColor: "warning",
        evidence: "[OCR partial failure in Section 4 — grammar in Observations section cannot be fully evaluated]",
        rationale: "Sections 1–3 and the conclusion demonstrate adequate grammar — passive voice is used appropriately (\"was conducted\", \"were configured\"). However, the critical Observations section (Section 4) suffered partial OCR failure due to smudging near the binding margin. The AI cannot evaluate grammar accuracy for that section and has penalised the score accordingly. This criterion should be reviewed by the instructor.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c2",
        title: "Vocabulary & Word Choice",
        score: 3, maxScore: 5, originalAiScore: 3,
        confidence: "Partial", confidenceColor: "accent",
        evidence: "Technical terms used correctly: \"subnet mask\", \"Ethernet\", \"LAN\"; vocabulary in visible sections is functional but not precise",
        rationale: "Where OCR is readable, vocabulary is appropriate and domain-specific terms are used correctly. The introduction and equipment list show good register. The conclusion is somewhat formulaic (\"functioned as expected\", \"without significant errors\") and could be more precise.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c3",
        title: "Coherence & Organisation",
        score: 2, maxScore: 5, originalAiScore: 2,
        confidence: "Weak", confidenceColor: "warning",
        evidence: "Section 4 (Observations) — the most important section of an observation report — is largely unreadable due to OCR smudge",
        rationale: "The report follows a structured format with numbered sections and a clear title, which is positive. However, the Observations section — which is the core of any observation report — cannot be evaluated due to OCR failure. The AI has penalised organisation because the most critical section appears incomplete or illegible. Instructor should verify the physical paper.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c4",
        title: "Tone, Format & Task Fulfilment",
        score: 4, maxScore: 5, originalAiScore: 4,
        confidence: "Strong", confidenceColor: "success",
        evidence: "Formal register maintained; date and location header present; numbered sections follow report conventions; task of documenting a lab session addressed in visible sections",
        rationale: "The student clearly understands the observation report format — numbered sections, formal tone, equipment listing, and contextual header (date, location) all present. The tone is appropriately formal throughout. The task is substantially fulfilled in the readable portions. Minor issue: the conclusion is generic rather than reflective.",
        isOverridden: false, overrideHistory: [],
      },
    ],
  },

  // sub-3: Deepak Raj — Business Proposal, Indian English concord appeal
  "sub-3": {
    id: "sub-3",
    assignmentId: 'BC-MECH-PROPOSAL',
    paperId: "MECH-A-012",
    studentName: "Deepak Raj",
    submittedAt: "1 day ago",
    status: "Needs Review",
    scenarioTag: "S2 — Strong Confidence, Active Appeal",
    antiCheatingFlags: { flagged: false, similarityScore: 0 },
    appeal: {
      id: "APL-001",
      status: "Pending",
      studentArgument: "I believe my Grammar & Sentence Structure score of 4 is inaccurate. The sentence the AI flagged — \"The college authority, along with the RTO, are requested to consider this proposal\" — is a formal register construction common in official Indian English correspondence. The use of \"are\" with a compound subject connected by \"along with\" follows a widely accepted proximity concord rule in formal Indian English. I would request the professor to reconsider.",
      date: "2026-04-01",
      aiTriage: "Needs Instructor Review",
      criterionDisputed: "c1",
    },
    ocrContent: `BUSINESS PROPOSAL
Student: Deepak Raj | Roll No: 2025MECH-A-012 | Paper ID: MECH-A-012
Course: Business Communication — Mechanical Engineering (Section A)

TO: The Principal, Sri Venkateswara Engineering College
FROM: Deepak Raj, 2nd Year Mechanical Engineering
DATE: 30 March 2026
SUBJECT: Proposal to Resolve Traffic Congestion at the College Main Gate

1. INTRODUCTION
This proposal addresses a critical issue that affects students, faculty, and local
residents on a daily basis — severe traffic congestion at the main entrance of our
college during peak hours (8:00–9:00 AM and 4:30–5:30 PM). The congestion leads
to delays, increased pollution, and safety risks for pedestrians.

2. PROBLEM STATEMENT
Currently, there is only one entry and exit lane at the main gate. During peak
hours, approximately 1,200 students and 200 staff members arrive or depart within
a 45-minute window. This volume exceeds the capacity of the existing infrastructure
by an estimated 60%. The result is a bottleneck that extends to the public road,
causing disruption to general traffic.

3. PROPOSED SOLUTION
3.1 Separate Entry and Exit Lanes
The primary recommendation is to redesign the gate to include two dedicated lanes —
one for entry and one for exit — effectively doubling the throughput capacity.

3.2 Staggered Departure Schedule
A phased departure schedule for students based on department could reduce peak
volume by approximately 35%, spreading the traffic load across a 90-minute window.

3.3 Shuttle Service from Nearby Bus Stop
A college-operated shuttle from the nearest public transport stop (approx. 800m)
would incentivise students to use public transport rather than private vehicles.

4. BUDGET ESTIMATE
Lane redesign and barrier installation: ₹3,50,000
Shuttle service (one vehicle, first year): ₹1,80,000
Total Estimated Cost: ₹5,30,000

5. CONCLUSION
The college authority, along with the RTO, are requested to consider this proposal
in the interest of student safety and academic punctuality. Implementation of even
one of the above measures would produce measurable improvements within one semester.`,
    criteria: [
      {
        id: "c1",
        title: "Grammar & Sentence Structure",
        score: 4, maxScore: 5, originalAiScore: 4,
        confidence: "Strong", confidenceColor: "success",
        evidence: "\"The college authority, along with the RTO, are requested to consider\" — subject-verb agreement: \"authority\" is singular; standard prescriptive grammar requires \"is requested\"",
        rationale: "The proposal demonstrates excellent sentence construction throughout. Formal passive constructions are used appropriately (\"is recommended\", \"would incentivise\"). The AI has identified one subject-verb agreement issue in the conclusion: \"authority...are requested\" — the head noun \"authority\" is singular. However, in formal Indian English administrative writing, the proximity concord rule is widely used. This may warrant instructor judgment.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c2",
        title: "Vocabulary & Word Choice",
        score: 5, maxScore: 5, originalAiScore: 5,
        confidence: "Strong", confidenceColor: "success",
        evidence: "\"bottleneck\", \"throughput\", \"incentivise\", \"phased\", \"proximity\" — precise formal vocabulary with no repetition",
        rationale: "Vocabulary throughout is precise, formal, and varied. The student correctly uses business/planning terminology such as \"throughput capacity\", \"phased departure\", and \"bottleneck\" in context. No generic or vague language detected. Register is consistently appropriate for a formal institutional proposal.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c3",
        title: "Coherence & Organisation",
        score: 5, maxScore: 5, originalAiScore: 5,
        confidence: "Strong", confidenceColor: "success",
        evidence: "Five clearly numbered sections; executive-style to/from/date/subject header; numbered sub-proposals; logical problem → solution → cost → conclusion flow",
        rationale: "Exemplary proposal structure. The student has used a formal memo-style header (To, From, Date, Subject) appropriate for an institutional proposal. The problem statement logically precedes the solution, which is itself broken into three numbered sub-proposals. Budget section follows solutions, and the conclusion is concise.",
        isOverridden: false, overrideHistory: [],
      },
      {
        id: "c4",
        title: "Tone, Format & Task Fulfilment",
        score: 5, maxScore: 5, originalAiScore: 5,
        confidence: "Strong", confidenceColor: "success",
        evidence: "Formal institutional tone; correct proposal format with header; specific quantitative evidence used; 500-word range met; conclusion contains call to action",
        rationale: "Tone is appropriately formal and persuasive. The student supports claims with concrete figures (1,200 students, ₹3,50,000, 35% reduction) which is excellent for a business proposal. The call to action in the conclusion is correctly phrased. Format fully conforms to expected proposal conventions. Task prompt fulfilled completely.",
        isOverridden: false, overrideHistory: [],
      },
    ],
  },
};

// ─── MOCK AUDIT LOG ────────────────────────────────────────────────────────────

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-04-01T08:15:00Z",
    actor: "System",
    action: "Evaluation Completed",
    targetSubmissionId: "sub-1",
    targetLabel: "MECH-A-047 — Arjun Mehta",
    details: "AI evaluation completed for TE-MECH-ESSAY — 4 criteria processed, all Strong confidence",
    actionColor: "success",
    assignmentId: "TE-MECH-ESSAY",
  },
  {
    id: "AUD-002",
    timestamp: "2026-04-01T09:30:00Z",
    actor: "System",
    action: "Evaluation Completed",
    targetSubmissionId: "sub-3",
    targetLabel: "MECH-A-012 — Deepak Raj",
    details: "AI evaluation completed for BC-MECH-PROPOSAL — 4 criteria processed, all Strong confidence",
    actionColor: "success",
    assignmentId: "BC-MECH-PROPOSAL",
  },
  {
    id: "AUD-003",
    timestamp: "2026-04-01T11:00:00Z",
    actor: "System",
    action: "Evaluation Partial",
    targetSubmissionId: "sub-2",
    targetLabel: "IT-B-023 — Kavitha Nair",
    details: "OCR partial failure detected in Section 4 (Observations). Criteria c1 and c3 flagged Weak confidence. Manual review required.",
    actionColor: "warning",
    assignmentId: "TE-IT-REPORT",
  },
  {
    id: "AUD-004",
    timestamp: "2026-04-01T14:20:00Z",
    actor: "Deepak Raj (Student)",
    action: "Appeal Filed",
    targetSubmissionId: "sub-3",
    targetLabel: "MECH-A-012 — Deepak Raj",
    details: "Grammar & Sentence Structure criterion disputed. Student argues \"along with\" compound subject follows formal Indian English concord convention.",
    actionColor: "warning",
    assignmentId: "BC-MECH-PROPOSAL",
  },
];

// ─── STORE IMPLEMENTATION ──────────────────────────────────────────────────────

export const useGradingStore = create<GradingStore>((set, get) => ({
  // Initial state
  courses: MOCK_COURSES,
  sections: MOCK_SECTIONS,
  assignments: MOCK_ASSIGNMENTS,
  submissions: MOCK_SUBMISSIONS,
  currentAssignmentId: 'TE-MECH-ESSAY',
  sessionState: {
    lastOpenedSubmissionId: 'sub-1',
    savedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 min ago → triggers stale session banner
    assignmentId: 'TE-MECH-ESSAY',
  },
  auditLog: MOCK_AUDIT_LOG,

  // Getters
  getAssignmentList: () => {
    const { assignments } = get();
    return Object.values(assignments).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getCurrentAssignment: () => {
    const { assignments, currentAssignmentId } = get();
    return currentAssignmentId ? assignments[currentAssignmentId] || null : null;
  },

  getSubmissionsForAssignment: (assignmentId: string) => {
    const { submissions } = get();
    return Object.values(submissions).filter(s => s.assignmentId === assignmentId);
  },

  getProcessedCount: (assignmentId?: string) => {
    const { submissions } = get();
    const subs = assignmentId 
      ? Object.values(submissions).filter(s => s.assignmentId === assignmentId)
      : Object.values(submissions);
    return subs.filter(s => s.status === "Approved").length;
  },

  getSubmissionList: (assignmentId?: string) => {
    const { submissions } = get();
    if (assignmentId) {
      return Object.values(submissions).filter(s => s.assignmentId === assignmentId);
    }
    return Object.values(submissions);
  },

  getCourses: () => {
    const { courses } = get();
    return Object.values(courses);
  },

  getSectionsForCourse: (courseId: string) => {
    const { sections } = get();
    return Object.values(sections).filter(s => s.courseId === courseId);
  },

  getAggregatedStats: () => {
    const { assignments, submissions, auditLog } = get();
    const allAssignments = Object.values(assignments);
    const allSubmissions = Object.values(submissions);
    
    // Calculate override rate
    let totalOverrides = 0;
    let totalCriteria = 0;
    allSubmissions.forEach(sub => {
      sub.criteria.forEach(c => {
        totalCriteria++;
        if (c.isOverridden) totalOverrides++;
      });
    });

    const assignmentsByStatus = allAssignments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAssignments: allAssignments.length,
      activeAssignments: allAssignments.filter(a => a.status === 'grading').length,
      completedAssignments: allAssignments.filter(a => a.status === 'completed').length,
      totalSubmissions: allSubmissions.length,
      processedSubmissions: allSubmissions.filter(s => s.status === 'Approved').length,
      pendingAppeals: allSubmissions.filter(s => s.appeal?.status === 'Pending').length,
      averageOverrideRate: totalCriteria > 0 ? Math.round((totalOverrides / totalCriteria) * 100) : 0,
      assignmentsByStatus,
    };
  },

  getAppealsForAssignment: (assignmentId?: string) => {
    const { submissions } = get();
    const subsWithAppeals = Object.values(submissions).filter(s => s.appeal);
    if (assignmentId) {
      return subsWithAppeals.filter(s => s.assignmentId === assignmentId);
    }
    return subsWithAppeals;
  },

  // Actions
  setCurrentAssignment: (assignmentId: string | null) => {
    set({ currentAssignmentId: assignmentId });
    if (assignmentId) {
      set(state => ({
        sessionState: {
          ...state.sessionState,
          assignmentId,
        },
      }));
    }
  },

  overrideScore: (submissionId, criterionId, newScore, reasonCode, instructorId) => {
    const { submissions } = get();
    const submission = submissions[submissionId];
    if (!submission) return;

    const criterion = submission.criteria.find(c => c.id === criterionId);
    if (!criterion) return;

    const oldScore = criterion.score;
    
    const overrideRecord: OverrideRecord = {
      criterionId,
      criterionTitle: criterion.title,
      originalScore: oldScore,
      newScore,
      reasonCode,
      reasonLabel: REASON_LABELS[reasonCode],
      instructorId,
      timestamp: new Date().toISOString(),
    };

    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...submission,
          criteria: submission.criteria.map(c =>
            c.id === criterionId
              ? {
                  ...c,
                  score: newScore,
                  isOverridden: true,
                  overrideHistory: [...c.overrideHistory, overrideRecord],
                }
              : c
          ),
        },
      },
      auditLog: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: instructorId,
          action: "Score Override",
          targetSubmissionId: submissionId,
          targetLabel: `${submission.paperId} — ${submission.studentName}`,
          details: `${criterion.title}: ${oldScore} → ${newScore} (${REASON_LABELS[reasonCode]})`,
          actionColor: "warning",
          assignmentId: submission.assignmentId,
        },
        ...state.auditLog,
      ],
    }));
  },

  approveSubmission: (submissionId) => {
    const { submissions } = get();
    const submission = submissions[submissionId];
    if (!submission) return;

    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...submission,
          status: "Approved",
        },
      },
      auditLog: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: "Prof. Sangeeth Kumar",
          action: "Submission Approved",
          targetSubmissionId: submissionId,
          targetLabel: `${submission.paperId} — ${submission.studentName}`,
          details: "Submission approved after instructor review",
          actionColor: "success",
          assignmentId: submission.assignmentId,
        },
        ...state.auditLog,
      ],
    }));
  },

  bulkApproveSubmissions: (submissionIds) => {
    const { submissions } = get();
    const updatedSubmissions: Record<string, Submission> = {};
    const newAuditEntries: AuditLogEntry[] = [];

    submissionIds.forEach(id => {
      const submission = submissions[id];
      if (submission) {
        updatedSubmissions[id] = { ...submission, status: "Approved" };
        newAuditEntries.push({
          id: `AUD-${Date.now()}-${id}`,
          timestamp: new Date().toISOString(),
          actor: "Prof. Sangeeth Kumar",
          action: "Bulk Approval",
          targetSubmissionId: id,
          targetLabel: `${submission.paperId} — ${submission.studentName}`,
          details: "Approved via bulk action",
          actionColor: "success",
          assignmentId: submission.assignmentId,
        });
      }
    });

    set(state => ({
      submissions: {
        ...state.submissions,
        ...updatedSubmissions,
      },
      auditLog: [...newAuditEntries, ...state.auditLog],
    }));
  },

  updateFeedbackTone: (submissionId, tone) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? { ...state.submissions[submissionId].feedback!, tone }
            : undefined,
        },
      },
    }));
  },

  updateFeedbackText: (submissionId, type, index, text) => {
    set(state => {
      const submission = state.submissions[submissionId];
      if (!submission?.feedback) return state;

      const updatedFeedback = { ...submission.feedback };
      const array = updatedFeedback[type] || [];
      
      // Ensure array has enough elements
      while (array.length <= index) {
        array.push('');
      }
      array[index] = text;
      updatedFeedback[type] = array;

      return {
        submissions: {
          ...state.submissions,
          [submissionId]: {
            ...submission,
            feedback: updatedFeedback,
          },
        },
      };
    });
  },

  releaseFeedback: (submissionId) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? { 
                ...state.submissions[submissionId].feedback!, 
                isReleased: true,
                releaseSchedule: { type: 'immediate' }
              }
            : undefined,
        },
      },
    }));
  },

  scheduleFeedbackRelease: (submissionId, schedule) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? { 
                ...state.submissions[submissionId].feedback!, 
                releaseSchedule: schedule,
                isReleased: false,
              }
            : undefined,
        },
      },
    }));
  },

  resolveAppeal: (submissionId, resolution) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          appeal: state.submissions[submissionId].appeal
            ? { 
                ...state.submissions[submissionId].appeal!, 
                status: "Resolved",
                resolution,
              }
            : undefined,
        },
      },
    }));
  },

  setSessionState: (partial) => {
    set(state => ({
      sessionState: { ...state.sessionState, ...partial },
    }));
  },

  // FeedbackStudio Actions
  getRefinementVariants: () => REFINEMENT_VARIANTS,

  startFeedbackGeneration: (submissionId, params) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedbackGenerationState: 'configuring',
          generationParams: params,
        },
      },
    }));
  },

  generateFeedback: (submissionId) => {
    const { submissions } = get();
    const submission = submissions[submissionId];
    if (!submission) return;

    // Simulate feedback generation based on criteria scores
    const avgScore = submission.criteria.reduce((sum, c) => sum + c.score, 0) / submission.criteria.length;
    const maxScore = submission.criteria.reduce((sum, c) => sum + c.maxScore, 0);
    const percentage = (avgScore / (maxScore / submission.criteria.length)) * 100;

    // Generate contextual feedback based on performance
    let strengths: string[] = [];
    let gaps: string[] = [];
    let improvements: string[] = [];
    let suggestions: string[] = [];
    let overallSummary = '';

    if (percentage >= 80) {
      strengths = [
        'Excellent command of grammar and sentence structure throughout the submission.',
        'Strong organizational skills with clear logical flow between sections.',
        'Effective use of technical vocabulary appropriate to the discipline.',
      ];
      gaps = [
        'Minor opportunities to further refine transitions between complex ideas.',
      ];
      improvements = [
        'Consider adding more specific examples to support key arguments.',
        'Explore advanced cohesive devices to elevate the writing further.',
      ];
      suggestions = [
        'Optional: Include a brief reflection on the process to demonstrate deeper engagement.',
      ];
      overallSummary = 'This is a strong submission that demonstrates excellent understanding of the assignment requirements. The writing is clear, well-organized, and technically accurate. With minor refinements, this could serve as a model submission.';
    } else if (percentage >= 60) {
      strengths = [
        'Good grasp of the core concepts and requirements.',
        'Clear attempt to structure the response logically.',
      ];
      gaps = [
        'Some grammatical inconsistencies that affect clarity.',
        'Vocabulary usage could be more precise and varied.',
      ];
      improvements = [
        'Review subject-verb agreement in complex sentences.',
        'Expand your use of transitional phrases to improve flow.',
        'Practice using discipline-specific terminology more consistently.',
      ];
      suggestions = [
        'Consider creating a personal checklist of common errors to review before submission.',
      ];
      overallSummary = 'This submission demonstrates a solid understanding of the assignment with room for improvement in technical accuracy and vocabulary range. The foundation is strong, and focused practice on the suggested areas will lead to significant improvement.';
    } else {
      strengths = [
        'Clear attempt to engage with the assignment topic.',
        'Some effective ideas are present and identifiable.',
      ];
      gaps = [
        'Grammatical errors frequently impede understanding.',
        'Organization needs significant development.',
        'Limited vocabulary range affects expression of ideas.',
      ];
      improvements = [
        'Focus on mastering basic sentence structure before attempting complex constructions.',
        'Use outlining to improve organizational coherence.',
        'Build a personal vocabulary journal with discipline-specific terms.',
        'Schedule office hours to discuss specific areas of difficulty.',
      ];
      suggestions = [
        'Consider utilizing the writing center for additional support.',
        'Review sample submissions to understand expectations more clearly.',
      ];
      overallSummary = 'This submission shows effort but requires significant improvement in multiple areas. The key is to focus on foundational skills—grammar, organization, and vocabulary—before attempting more advanced techniques. With dedicated practice and support, improvement is achievable.';
    }

    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...submission,
          feedbackGenerationState: 'generated',
          feedback: {
            strengths,
            gaps,
            improvements,
            suggestions,
            overallSummary,
            personalNote: '',
            highlights: [],
            linkedEvidence: [],
            tone: 'Constructive',
            isReleased: false,
            releaseSchedule: { type: 'manual' },
          },
        },
      },
      auditLog: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'System',
          action: 'Feedback Generated',
          targetSubmissionId: submissionId,
          targetLabel: `${submission.paperId} — ${submission.studentName}`,
          details: 'AI-generated personalized feedback based on rubric evaluation',
          actionColor: 'success',
          assignmentId: submission.assignmentId,
        },
        ...state.auditLog,
      ],
    }));
  },

  applyRefinement: (submissionId, variantId) => {
    const variant = REFINEMENT_VARIANTS.find(v => v.id === variantId);
    if (!variant) return;

    const { submissions } = get();
    const submission = submissions[submissionId];
    if (!submission?.feedback) return;

    const refinedFeedback = variant.transform(submission.feedback);

    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...submission,
          feedback: refinedFeedback,
        },
      },
      auditLog: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Prof. Sangeeth Kumar',
          action: 'Feedback Refined',
          targetSubmissionId: submissionId,
          targetLabel: `${submission.paperId} — ${submission.studentName}`,
          details: `Applied refinement: ${variant.name}`,
          actionColor: 'accent',
          assignmentId: submission.assignmentId,
        },
        ...state.auditLog,
      ],
    }));
  },

  updateOverallSummary: (submissionId, summary) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? { ...state.submissions[submissionId].feedback!, overallSummary: summary }
            : undefined,
        },
      },
    }));
  },

  updatePersonalNote: (submissionId, note) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? { ...state.submissions[submissionId].feedback!, personalNote: note }
            : undefined,
        },
      },
    }));
  },

  addHighlight: (submissionId, highlight) => {
    const newHighlight: TextHighlight = {
      ...highlight,
      id: `hl-${Date.now()}`,
    };
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? {
                ...state.submissions[submissionId].feedback!,
                highlights: [...(state.submissions[submissionId].feedback!.highlights || []), newHighlight],
              }
            : undefined,
        },
      },
    }));
  },

  removeHighlight: (submissionId, highlightId) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? {
                ...state.submissions[submissionId].feedback!,
                highlights: state.submissions[submissionId].feedback!.highlights?.filter(h => h.id !== highlightId) || [],
                linkedEvidence: state.submissions[submissionId].feedback!.linkedEvidence?.filter(l => l.highlightId !== highlightId) || [],
              }
            : undefined,
        },
      },
    }));
  },

  linkEvidence: (submissionId, link) => {
    const newLink: EvidenceLink = {
      ...link,
      id: `link-${Date.now()}`,
    };
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? {
                ...state.submissions[submissionId].feedback!,
                linkedEvidence: [...(state.submissions[submissionId].feedback!.linkedEvidence || []), newLink],
              }
            : undefined,
        },
      },
    }));
  },

  unlinkEvidence: (submissionId, linkId) => {
    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: {
          ...state.submissions[submissionId],
          feedback: state.submissions[submissionId].feedback
            ? {
                ...state.submissions[submissionId].feedback!,
                linkedEvidence: state.submissions[submissionId].feedback!.linkedEvidence?.filter(l => l.id !== linkId) || [],
              }
            : undefined,
        },
      },
    }));
  },

  approveFeedback: (submissionId) => {
    const { submissions } = get();
    const submission = submissions[submissionId];
    if (!submission?.feedback) return;

    const approvedSubmission: Submission = {
      ...submission,
      feedbackGenerationState: 'approved',
      approvedFeedback: submission.feedback,
    };

    set(state => ({
      submissions: {
        ...state.submissions,
        [submissionId]: approvedSubmission,
      },
      auditLog: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Prof. Sangeeth Kumar',
          action: 'Feedback Approved',
          targetSubmissionId: submissionId,
          targetLabel: `${submission.paperId} — ${submission.studentName}`,
          details: 'Feedback approved and ready for release',
          actionColor: 'success',
          assignmentId: submission.assignmentId,
        },
        ...state.auditLog,
      ],
    }));
  },
}));

// ─── REFINEMENT VARIANTS ───────────────────────────────────────────────────────

const REFINEMENT_VARIANTS: RefinementVariant[] = [
  {
    id: 'simplify',
    name: 'Simplify Language',
    description: 'Make feedback more accessible and easier to understand',
    transform: (feedback) => ({
      ...feedback,
      strengths: feedback.strengths.map(s => s.replace(/demonstrates/g, 'shows').replace(/exemplary/g, 'great')),
      gaps: feedback.gaps.map(g => g.replace(/impede/g, 'block').replace(/significant/g, 'important')),
      improvements: feedback.improvements.map(i => i.replace(/utilizing/g, 'using').replace(/cohesive devices/g, 'connecting words')),
      suggestions: feedback.suggestions?.map(s => s.replace(/consider/g, 'try')),
    }),
  },
  {
    id: 'encouraging',
    name: 'More Encouraging',
    description: 'Add positive reinforcement and growth mindset language',
    transform: (feedback) => ({
      ...feedback,
      strengths: [`Great job on this submission! ${feedback.strengths[0]}`, ...feedback.strengths.slice(1)],
      gaps: feedback.gaps.map(g => `Opportunity for growth: ${g}`),
      improvements: feedback.improvements.map(i => `You can strengthen your work by: ${i}`),
      overallSummary: `You've made solid progress! ${feedback.overallSummary || ''}`,
    }),
  },
  {
    id: 'strict',
    name: 'More Direct',
    description: 'Be clearer about expectations and gaps',
    transform: (feedback) => ({
      ...feedback,
      strengths: feedback.strengths,
      gaps: feedback.gaps.map(g => `Must address: ${g}`),
      improvements: feedback.improvements.map(i => `Required: ${i}`),
      overallSummary: feedback.overallSummary?.replace(/solid/g, 'insufficient').replace(/room for improvement/g, 'significant issues to address'),
    }),
  },
  {
    id: 'shorter',
    name: 'Keep it Short',
    description: 'Reduce length while keeping key points',
    transform: (feedback) => ({
      ...feedback,
      strengths: feedback.strengths.slice(0, 2),
      gaps: feedback.gaps.slice(0, 2),
      improvements: feedback.improvements.slice(0, 3),
      suggestions: feedback.suggestions?.slice(0, 1),
      overallSummary: feedback.overallSummary?.split('.').slice(0, 2).join('.') + '.',
    }),
  },
  {
    id: 'detail',
    name: 'Add More Detail',
    description: 'Expand explanations with specific examples',
    transform: (feedback) => ({
      ...feedback,
      strengths: feedback.strengths.map(s => `${s} For example, your use of formal transitions shows awareness of academic conventions.`),
      gaps: feedback.gaps.map(g => `${g} This affects the reader's ability to follow your argument clearly.`),
      improvements: feedback.improvements.map(i => `${i} Practicing this skill will improve all your future writing.`),
    }),
  },
  {
    id: 'examples',
    name: 'Include Examples',
    description: 'Add concrete examples to illustrate feedback',
    transform: (feedback) => ({
      ...feedback,
      strengths: [...feedback.strengths, 'For instance, your introduction clearly sets up the main argument.'],
      gaps: [...feedback.gaps, 'For example, the conclusion lacks a clear summary statement.'],
      suggestions: [...(feedback.suggestions || []), 'Try reviewing a sample A-grade submission to see these elements in action.'],
    }),
  },
];
