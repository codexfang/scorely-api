const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8400'

const FALLBACK_QUESTIONS = [
  { id: 'AC-1', category: 'Access Control', question: 'Does your organization enforce role-based access control (RBAC) across all systems?', answer_type: 'boolean', weight: 1.0, guidance: 'Verify that access permissions are granted based on job function.' },
  { id: 'AC-2', category: 'Access Control', question: 'Are access reviews conducted at least quarterly for all privileged accounts?', answer_type: 'choice', options: ['yes', 'no', 'partial'], weight: 1.0, guidance: 'Quarterly reviews help identify excessive or inappropriate access.' },
  { id: 'CR-1', category: 'Cryptography', question: 'Are all data-in-transit encrypted using TLS 1.2 or higher?', answer_type: 'boolean', weight: 1.2, guidance: 'TLS ensures confidentiality and integrity during transmission.' },
  { id: 'DP-1', category: 'Data Protection', question: 'Do you maintain a data classification policy that covers all data assets?', answer_type: 'boolean', weight: 1.0, guidance: 'Classification enables appropriate handling based on sensitivity.' },
  { id: 'IR-1', category: 'Incident Response', question: 'Does your organization have a documented incident response plan?', answer_type: 'boolean', weight: 1.2, guidance: 'A formal plan ensures consistent response to security events.' },
  { id: 'CO-1', category: 'Compliance', question: 'Does your organization hold a valid SOC 2 Type II report (issued within the last 12 months)?', answer_type: 'boolean', weight: 1.3, guidance: 'SOC 2 demonstrates independent validation of controls.' },
  { id: 'NS-1', category: 'Network Security', question: 'Is network segmentation implemented to separate production environments from other networks?', answer_type: 'boolean', weight: 1.2, guidance: 'Segmentation limits the blast radius of a compromise.' },
]

const FALLBACK_SCORE = {
  overall_score: 42.5,
  risk_level: 'Medium',
  category_scores: { 'Access Control': 35.0, 'Cryptography': 50.0, 'Data Protection': 25.0, 'Incident Response': 60.0, 'Compliance': 40.0, 'Network Security': 45.0 },
  recommendations: [
    'Moderate risk in Access Control. Address key gaps within the next quarter.',
    'Moderate risk in Cryptography. Address key gaps within the next quarter.',
    'Low risk in Data Protection. Continue monitoring and periodic reviews.',
  ],
}

export async function createAssessment(orgName, assessor) {
  const res = await fetch(`${API_BASE}/api/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organization: orgName, assessor }),
  })
  if (!res.ok) throw new Error('Failed to create assessment')
  return res.json()
}

export async function getAssessment(token) {
  const res = await fetch(`${API_BASE}/api/assessments/${token}`)
  if (!res.ok) throw new Error('Assessment not found')
  return res.json()
}

export async function submitAnswers(token, answers) {
  const res = await fetch(`${API_BASE}/api/assessments/${token}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) throw new Error('Failed to submit answers')
  return res.json()
}

export async function getScore(token) {
  const res = await fetch(`${API_BASE}/api/assessments/${token}/score`)
  if (!res.ok) throw new Error('Score not available')
  return res.json()
}

export function getReportUrl(token) {
  return `${API_BASE}/api/assessments/${token}/report.pdf`
}

export function getFallbackQuestions() {
  return FALLBACK_QUESTIONS
}

export function getFallbackScore() {
  return FALLBACK_SCORE
}
