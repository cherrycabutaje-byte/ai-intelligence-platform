\# EvidenceRecord V2 Migration Plan



\## Goal



Migrate from EvidenceRecord to EvidenceRecordV2 without breaking existing intelligence engines.



\---



\## Current State



EvidenceRecord V1 is currently used by:



\### Producers



\* Human Behavior Engine

\* Audience Intelligence

\* Story Intelligence



\### Consumers



\* Learning Builder

\* Learning Updater

\* Confidence Updater

\* Knowledge Builder

\* Memory Manager



\---



\## Phase 0



Create EvidenceRecordV2.



Do not use it in production.



Document it.



Freeze the contract.



\---



\## Phase 1



Allow V1 and V2 to coexist.



Backward compatibility is required.



Existing engines must continue working.



\---



\## Phase 2



Update producers to emit EvidenceRecordV2.



One engine at a time.



Suggested order:



1\. Story Intelligence

2\. Audience Intelligence

3\. Human Behavior Engine



\---



\## Phase 3



Update consumers to accept EvidenceRecordV2.



Memory Manager



Learning Builder



Learning Updater



Confidence Updater



Knowledge Builder



\---



\## Phase 4



Run integration tests.



Required tests:



Human Behavior Learning



Audience Learning



Story Learning



Memory Persistence



Learning Updates



\---



\## Phase 5



Retire EvidenceRecord V1.



Only after all integration tests pass.



\---



\## Success Criteria



All intelligence engines produce EvidenceRecordV2.



Memory Manager accepts EvidenceRecordV2.



No custom memory logic exists for any intelligence engine.



\---



\## Design Principle



Migration should prioritize stability over speed.



A working system is more valuable than a cleaner contract.



