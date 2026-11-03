# DATUM V2.2 release

Product V2.2, package 0.3.0. Previous production commit: eab2646b266d63b1bd86ca7f8f4cd62dd39bf6e6.

Publication status: pending final test gates and workflow verification. This file must be updated with actual release evidence.

Authorized destination: https://shadabur-rahaman.github.io/datum/#/ through the existing main-branch Pages workflow. No force push. Database migrations are additive and are not silently applied to a remote project.

Deploy checklist: preserve prior guest data, run unit/SQL/Edge/browser gates, verify build identity and published routes, real Python and guest persistence. Cloud activation remains BLOCKED until configured and tested. No stakeholder messaging is authorized or sent.

Rollback: if a published guest flow fails or a new critical data-loss/security issue is found, revert the V2.2 release commit with a new normal commit, run gates and redeploy. Keep exported drafts. Do not roll back by deleting learning tables or forcing Git history. New document IDs remain separate from original V2.1 drafts; earlier releases ignore them.
