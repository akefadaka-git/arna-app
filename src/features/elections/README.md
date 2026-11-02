# Board Election frontend integration

This folder contains the first A3 frontend contract layer only.

- `types.ts` defines the election, register snapshot, entitlement and physical ballot custody wire shapes.
- `labels.ts` provides Amharic-first and English copy for the election workspace.

No router entry, API transport call or interactive election screen is added yet. The API controller/permission contracts and the legal authority workflow must be implemented and verified first. This prevents a frontend surface from appearing operational while its security and backend contracts are incomplete.

Electronic voting is not represented as an available method. The only current method type is physical.
