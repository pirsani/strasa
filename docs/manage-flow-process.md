# Flow Process

```ts
enum ALUR_PROSES {
  SETUP
  PENGAJUAN
  VERIFIKASI
  NOMINATIF
  PEMBAYARAN
  SELESAI
}

enum JENIS_PENGAJUAN {
  GENERATE_RAMPUNGAN
  HONORARIUM
  UH
  UH_DALAM_NEGERI
  UH_LUAR_NEGERI
  PENGGANTIAN_REINBURSEMENT
  PEMBAYARAN_PIHAK_KETIGA
}

enum STATUS_PENGAJUAN {
  DRAFT
  SUBMITTED
  REVISE
  REVISED
  VERIFIED
  APPROVED
  REQUEST_TO_PAY
  PAID
  DONE
  END
}
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
