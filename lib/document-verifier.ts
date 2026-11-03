// Deterministic document verification without LLM

export interface SampleDocAadhaar {
  docType: 'Aadhaar Card';
  docNumber: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  addressState: string;
}

export interface SampleDocIncome {
  docType: 'Income Certificate';
  certificateNumber: string;
  name: string;
  dob: string; // YYYY-MM-DD
  annualIncome: number;
  issuingState: string;
  validUntil: string; // YYYY-MM-DD
}

// Hardcoded sample documents with deliberate name spelling mismatch ("Aarav" vs "Arav")
// and DOB mismatch ("2005-04-12" vs "2005-04-21")
export const sampleAadhaar: SampleDocAadhaar = {
  docType: 'Aadhaar Card',
  docNumber: 'XXXX-XXXX-4821',
  name: 'Aarav Sharma',
  dob: '2005-04-12',
  gender: 'Male',
  addressState: 'Uttar Pradesh'
};

export const sampleIncomeCert: SampleDocIncome = {
  docType: 'Income Certificate',
  certificateNumber: 'UP/INC/2024/98172',
  name: 'Arav Sharma', // Deliberate mismatch: single 'a'
  dob: '2005-04-21',   // Deliberate mismatch: 21st vs 12th
  annualIncome: 180000,
  issuingState: 'Uttar Pradesh',
  validUntil: '2025-03-31'
};

export interface VerificationCheck {
  id: string;
  field: string;
  status: 'passed' | 'failed' | 'warning';
  riskLevel: 'HIGH_RISK' | 'LOW_RISK' | 'NONE';
  aadhaarValue: string;
  incomeCertValue: string;
  issue: string;
  exactFix: string;
}

export interface VerificationReport {
  overallRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  rejectionLikelihood: string;
  checks: VerificationCheck[];
  timestamp: string;
}

// Levenshtein distance for fuzzy name comparison
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function verifyDocuments(
  aadhaar: SampleDocAadhaar = sampleAadhaar,
  incomeCert: SampleDocIncome = sampleIncomeCert
): VerificationReport {
  const checks: VerificationCheck[] = [];

  // Check 1: Name Matching (Fuzzy Levenshtein)
  const normAadhaarName = aadhaar.name.trim().toLowerCase();
  const normIncomeName = incomeCert.name.trim().toLowerCase();
  const nameDist = levenshteinDistance(normAadhaarName, normIncomeName);

  if (normAadhaarName === normIncomeName) {
    checks.push({
      id: 'name-check',
      field: 'Full Name',
      status: 'passed',
      riskLevel: 'NONE',
      aadhaarValue: aadhaar.name,
      incomeCertValue: incomeCert.name,
      issue: 'Exact match verified',
      exactFix: 'No action required. Names match identically across both documents.'
    });
  } else {
    checks.push({
      id: 'name-check',
      field: 'Full Name Matching',
      status: 'failed',
      riskLevel: 'HIGH_RISK',
      aadhaarValue: aadhaar.name,
      incomeCertValue: incomeCert.name,
      issue: `Spelling mismatch detected (difference of ${nameDist} character(s): "${aadhaar.name}" vs "${incomeCert.name}"). Portal automated KYC rejects mismatched names.`,
      exactFix: `Correction required: Visit your local CSC / Tehsil center to re-issue the Income Certificate with the exact spelling "${aadhaar.name}" as registered in Aadhaar, or update Aadhaar via myaadhaar.uidai.gov.in.`
    });
  }

  // Check 2: Date of Birth Comparison
  if (aadhaar.dob === incomeCert.dob) {
    checks.push({
      id: 'dob-check',
      field: 'Date of Birth (DOB)',
      status: 'passed',
      riskLevel: 'NONE',
      aadhaarValue: aadhaar.dob,
      incomeCertValue: incomeCert.dob,
      issue: 'DOB verified',
      exactFix: 'No action required. Dates of birth match identically.'
    });
  } else {
    checks.push({
      id: 'dob-check',
      field: 'Date of Birth (DOB) Parity',
      status: 'failed',
      riskLevel: 'HIGH_RISK',
      aadhaarValue: aadhaar.dob,
      incomeCertValue: incomeCert.dob,
      issue: `Date of birth mismatch: Aadhaar records ${aadhaar.dob} whereas Income Certificate records ${incomeCert.dob}. Government scholarship portals (NSP) will auto-reject during DBT validation.`,
      exactFix: `Correction required: Present Class 10th Admit Card / Marksheet at the Revenue Sub-Divisional Magistrate (SDM) / Tehsildar office to issue an amended Income Certificate reflecting the true DOB (${aadhaar.dob}).`
    });
  }

  // Check 3: State / Domicile Consistency
  if (aadhaar.addressState.toLowerCase() === incomeCert.issuingState.toLowerCase()) {
    checks.push({
      id: 'state-check',
      field: 'State of Domicile',
      status: 'passed',
      riskLevel: 'NONE',
      aadhaarValue: aadhaar.addressState,
      incomeCertValue: incomeCert.issuingState,
      issue: 'State match verified',
      exactFix: 'Both documents belong to the same state jurisdiction.'
    });
  } else {
    checks.push({
      id: 'state-check',
      field: 'State of Domicile',
      status: 'failed',
      riskLevel: 'HIGH_RISK',
      aadhaarValue: aadhaar.addressState,
      incomeCertValue: incomeCert.issuingState,
      issue: `State mismatch: Aadhaar is ${aadhaar.addressState} but certificate is from ${incomeCert.issuingState}.`,
      exactFix: 'Update your Aadhaar address or acquire an income certificate from your resident state.'
    });
  }

  // Check 4: Income Ceiling Check (Rule-based)
  const isUnderMaxIncome = incomeCert.annualIncome <= 250000;
  checks.push({
    id: 'income-check',
    field: 'Income Eligibility Threshold',
    status: isUnderMaxIncome ? 'passed' : 'warning',
    riskLevel: isUnderMaxIncome ? 'NONE' : 'LOW_RISK',
    aadhaarValue: 'N/A (Derived)',
    incomeCertValue: `₹${incomeCert.annualIncome.toLocaleString('en-IN')}`,
    issue: isUnderMaxIncome
      ? `Income ₹${incomeCert.annualIncome.toLocaleString('en-IN')} satisfies both Post-Matric SC (≤ ₹2.5L) and PM-USP CSSS (≤ ₹4.5L).`
      : `Income ₹${incomeCert.annualIncome.toLocaleString('en-IN')} exceeds Post-Matric SC ceiling (₹2.5L) but is eligible for PM-USP (≤ ₹4.5L).`,
    exactFix: isUnderMaxIncome
      ? 'No action required. Income qualifies for both schemes.'
      : 'Apply under PM-USP CSSS (income limit ₹4.5 Lakh).'
  });

  const failureCount = checks.filter(c => c.status === 'failed').length;
  const overallRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
    failureCount >= 2 ? 'HIGH' : failureCount === 1 ? 'MEDIUM' : 'LOW';

  const rejectionLikelihood =
    failureCount >= 2
      ? 'Very High (95%+ chance of automated portal rejection)'
      : failureCount === 1
      ? 'Moderate (Subject to manual clerk query)'
      : 'Low (Clean documents ready for submission)';

  return {
    overallRisk,
    rejectionLikelihood,
    checks,
    timestamp: new Date().toISOString()
  };
}
