\# Unified Evidence Architecture



\## Purpose



All intelligence engines must produce a common evidence contract.



This ensures:



Observation

↓

Hypothesis

↓

Evidence

↓

Learning

↓

Memory



remains consistent across the platform.



\---



\## Current Evidence Producers



\### Human Behavior Engine



Human Behavior

↓

EvidenceRecord

↓

Memory Manager



\### Audience Intelligence



Audience Signals

↓

Audience Hypothesis

↓

Audience Observation

↓

EvidenceRecord

↓

Memory Manager



\### Story Intelligence



Story Signals

↓

Story Hypothesis

↓

Story Observation

↓

EvidenceRecord

↓

Memory Manager



\---



\## Future Evidence Producers



Hook Intelligence



Retention Intelligence



Emotion Intelligence



Packaging Intelligence



Business Intelligence



All future engines must eventually produce:



EvidenceRecordV2



\---



\## EvidenceRecordV2



```ts

export type EvidenceSourceType =

&#x20; | 'human\_behavior'

&#x20; | 'audience'

&#x20; | 'story'

&#x20; | 'hook'

&#x20; | 'retention'

&#x20; | 'emotion'

&#x20; | 'packaging'

&#x20; | 'business';



export interface EvidenceRecordV2 {

&#x20; schemaVersion: 2;



&#x20; sourceId: string;



&#x20; sourceType: EvidenceSourceType;



&#x20; hypothesis: string;



&#x20; result:

&#x20;   | 'validated'

&#x20;   | 'rejected'

&#x20;   | 'inconclusive';



&#x20; evidenceStrength: number;



&#x20; learning: string;



&#x20; createdAt: string;



&#x20; metadata?: Record<string, unknown>;

}

```



\---



\## Design Principle



Engine-specific fields belong inside metadata.



Examples:



Audience:



```ts

metadata: {

&#x20; signalCount: 12,

&#x20; dominantDesire: 'hope'

}

```



Story:



```ts

metadata: {

&#x20; storyType: 'transformation',

&#x20; conflictStrength: 82

}

```



Hook:



```ts

metadata: {

&#x20; hookDuration: 18,

&#x20; curiosityGap: 76

}

```



The Memory Manager should not care about engine-specific details.



It should only consume EvidenceRecordV2.



\---



\## Platform Standard



All future intelligence engines must follow:



Signals

↓

Hypothesis

↓

Observation

↓

EvidenceRecordV2

↓

Memory Manager

↓

Learning

↓

Updated Belief



