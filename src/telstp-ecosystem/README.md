# TELsTP Ecosystem Integration Hooks
# This folder contains integration points for the OmniCognitor ecosystem

## Future Hub Integration Points

### Hub 5 — Clinical Trial Matching
- Patient data from WellnessAI sessions (with consent) can feed into clinical trial matching
- Integration endpoint: `/api/ecosystem/clinical-trials`
- Data format: Anonymized symptom profiles + lab results

### Hub 7 — Precision Medicine
- AssistAI clinical summaries can integrate with precision medicine workflows
- Integration endpoint: `/api/ecosystem/precision-med`
- Data format: Structured clinical summaries with pharmacogenomic markers

## OmniCognitor Auth Integration
When the full OmniCog auth system is ready:
1. Replace anonymous access with OmniCog JWT tokens
2. Enable cross-hub session sharing
3. Activate unified patient memory layer

## Router Configuration
The 12-hub router will use these paths:
- `/telstp/tawasol-now/wellness` → My-WellnessAI
- `/telstp/tawasol-now/assist` → My-AssistAI
- `/telstp/tawasol-now/hub` → Hub Landing Page
