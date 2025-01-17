export default async function RampunganDetilPage({
  params,
}: {
  params: Promise<{ pengajuanId: string }>;
}) {
  const pengajuanId = (await params).pengajuanId;
  return <h1>My Page Rampungan {pengajuanId} </h1>;
}
