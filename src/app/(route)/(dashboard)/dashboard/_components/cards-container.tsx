import { StatusCount } from "@/data/kegiatan/riwayat-pengajuan";
import Card from "./card";

interface CardsContainerProps {
  data: StatusCount[] | null;
}
const CardsContainer = ({ data }: CardsContainerProps) => {
  let pengajuanCount = 0;
  let revisiCount = 0;
  let tahapPembayaranCount = 0;
  let finishingDokumenCount = 0;

  if (data) {
    const submittedItem = data.find((item) => item.status === "SUBMITTED");
    const reviseItem = data.find((item) => item.status === "REVISE");
    const requestToPayItem = data.find(
      (item) => item.status === "REQUEST_TO_PAY"
    );
    const paidItem = data.find((item) => item.status === "PAID");

    pengajuanCount = submittedItem ? Number(submittedItem.count) : 0;
    revisiCount = reviseItem ? Number(reviseItem.count) : 0;
    tahapPembayaranCount = requestToPayItem
      ? Number(requestToPayItem.count)
      : 0;
    finishingDokumenCount = paidItem ? Number(paidItem.count) : 0;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Card
        title="Pengajuan"
        jumlah={pengajuanCount}
        bgColor="bg-blue-500"
        moreInfo={"/pengajuan/filter-by/status/SUBMITTED"}
      />
      <Card
        title="Revisi"
        jumlah={revisiCount}
        bgColor="bg-red-400"
        moreInfo={"/pengajuan/filter-by/status/REVISE"}
      />
      <Card
        title="Tahap Pembayaran"
        jumlah={tahapPembayaranCount}
        bgColor="bg-green-500"
        moreInfo={"/pengajuan/filter-by/status/REQUEST_TO_PAY"}
      />
      <Card
        title="Butuh Finishing Dokumen"
        jumlah={finishingDokumenCount}
        bgColor="bg-gray-400"
        moreInfo={"/pengajuan/filter-by/status/PAID"}
      />
    </div>
  );
};

export default CardsContainer;
