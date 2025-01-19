export default async function UhLuarNegeriDetilPage({
  params,
}: {
  params: Promise<{ pengajuanId: string }>;
}) {
  const pengajuanId = (await params).pengajuanId;
  return <h1> {pengajuanId} </h1>;
}
