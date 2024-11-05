# rbac

```ts
const pengguna = await getSessionPenggunaForAction();
if (!pengguna.success) {
  return pengguna;
}

const satkerId = pengguna.data.satkerId;
const unitKerjaId = pengguna.data.unitKerjaId;
const penggunaId = pengguna.data.penggunaId;
```
