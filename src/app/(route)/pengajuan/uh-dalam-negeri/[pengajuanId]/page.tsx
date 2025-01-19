export default async function UhDalamNegeriDetilPage({
  params,
}: {
  params: Promise<{ pengajuanId: string }>;
}) {
  const pengajuanId = (await params).pengajuanId;
  return (
    <h1 className="font-bold text-lg p-4 w-full items-center justify-center text-gray-500">
      Under construction
    </h1>
  );
}
