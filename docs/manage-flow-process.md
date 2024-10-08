# Flow Process

```ts
type StatusLangkah =
  | "Draft"
  | "Submitted"
  | "Revise"
  | "Revised"
  | "Paid"
  | "End";

const langkah = [
  "setup",
  "pengajuan",
  "verifikasi",
  "nominatif",
  "pembayaran",
  "selesai",
];
```

Example Workflow

1. Initial Submission:

Status: Draft
The kegiatan is being created or edited.

2. Review Requested:

Status: Submitted
The kegiatan is submitted for review.

3. Request for Changes:

Status: Revise
A reviewer or system requests changes or revisions.

4. Revisions Made:

Status: Revised
The user has made the necessary changes, and the kegiatan is updated.

5. Final Approval:

Status: Paid
The kegiatan has been reviewed and approved.
