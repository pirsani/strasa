import { updateJumlahJpJadwalNarasumber } from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import { OptionSbm } from "@/actions/sbm";
import ButtonEye from "@/components/button-eye-open-document";
import { Button } from "@/components/ui/button";
import { StatusLangkah } from "@/lib/constants";
import { getBesaranPajakHonorarium } from "@/lib/pajak";
import formatCurrency from "@/utils/format-currency";
import { JadwalNarasumber, Narasumber } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";
import { toast } from "sonner";

interface PerkiraanPembayaran {
  pajak: Decimal;
  honorarium: Decimal;
}

interface NarasumberDetailProps {
  narasumber: Narasumber;
  jadwalNarasumber: JadwalNarasumber;
  optionsSbmHonorarium?: OptionSbm[];
  proses?: "pengajuan" | "verfikasi" | "pembayaran";
  statusPengajuanHonorarium?: StatusLangkah | null;
}

const NarasumberDetail = ({
  narasumber,
  jadwalNarasumber,
  optionsSbmHonorarium = [],
  proses,
  statusPengajuanHonorarium = null,
}: NarasumberDetailProps) => {
  const [perkiraanPembayaran, setPerkiraanPembayaran] =
    useState<PerkiraanPembayaran>({
      pajak: new Decimal(0),
      honorarium: new Decimal(0),
    });
  const [JumlahJP, setJumlahJP] = useState<Decimal>(
    new Decimal(jadwalNarasumber.jumlahJamPelajaran || 0) // default to 0
  );

  const [selectedSbmHonorarium, setSelectedSbmHonorarium] =
    useState<OptionSbm | null>(null);

  // ignore react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (jadwalNarasumber.jenisHonorariumId !== null) {
      const defaultOption =
        optionsSbmHonorarium.find(
          (option) => option.value === jadwalNarasumber.jenisHonorariumId
        ) || null;
      //console.log("defaultOption", defaultOption);
      setSelectedSbmHonorarium(defaultOption);
    }
    //console.log("selectedSbmHonorarium", jadwalNarasumber.jenisHonorariumId);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jadwalNarasumber]);

  //const sbm: Decimal = new Decimal(1700000); // dari tabel referensi sbm_honorarium
  // pajak ASN
  let besaranPajak = new Decimal(0.05);
  if (narasumber.pangkatGolonganId) {
    const { besaranPajakMemilikiNpwp, besaranTanpaNpwp } =
      getBesaranPajakHonorarium(narasumber.pangkatGolonganId, narasumber.NPWP);
    besaranPajak = besaranTanpaNpwp || besaranPajakMemilikiNpwp; // jika tidak ada Npwp, maka pajak lebih tinggi 20%
  } else {
    if (!narasumber.NPWP || narasumber.NPWP === "" || narasumber.NPWP === "-") {
      besaranPajak = besaranPajak.times(1.2);
    }
  }
  // const besaranPajak = useMemo(
  //   () =>
  //     getBesaranPajakHonorarium(narasumber.pangkatGolonganId, narasumber.NPWP),
  //   []
  // );

  const handleJpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Ensure the value is a valid number
    if (value === "" || isNaN(Number(value))) {
      // Handle invalid input if necessary (e.g., set a default value or show an error)
      setJumlahJP(new Decimal(0));
    } else {
      // Convert to Decimal and update state
      setJumlahJP(new Decimal(value));
    }
  };

  const handleSbmHonorariumChange = (selected: OptionSbm | null) => {
    console.log("Selected sbm honorarium:", selected);
    setSelectedSbmHonorarium(selected);
  };

  useEffect(() => {
    if (JumlahJP.gt(0)) {
      const sbm = selectedSbmHonorarium?.besaran || new Decimal(0);
      let dpp = JumlahJP.times(sbm);
      if (!narasumber.NIP || narasumber.NIP === "" || narasumber.NIP === "-") {
        dpp = dpp.times(0.5);
      }
      setPerkiraanPembayaran({
        pajak: dpp.times(besaranPajak),
        honorarium: JumlahJP.times(sbm),
      });
    } else {
      setPerkiraanPembayaran({
        pajak: new Decimal(0),
        honorarium: new Decimal(0),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JumlahJP, selectedSbmHonorarium]);

  const handleUpdateJp = async () => {
    if (proses === "pengajuan") {
      // update JP dan update jenis honorarium
      const jenisHonorariumId = selectedSbmHonorarium?.value || null;
      const jumlahJamPelajaran = JumlahJP.toNumber();
      const updatedJadwalNarasumber = await updateJumlahJpJadwalNarasumber(
        jadwalNarasumber.id,
        jumlahJamPelajaran,
        jenisHonorariumId
      );
      if (!updatedJadwalNarasumber.success) {
        return;
      } else {
        toast.success("JP dan Jenis Honorarium diperbarui");
      }
    }
    if (proses === "verfikasi") {
      //
    }
  };

  // jumlah JP dan jenis honorarium hanya bisa dilakukan jika isOnPengajuan isOnVerifikasi bernilai true

  // const isOnPengajuan =
  //   proses === "pengajuan" &&
  //   (!statusPengajuanHonorarium || statusPengajuanHonorarium === "Revise");

  // const isOnVerifikasi =
  //   proses === "verfikasi" &&
  //   statusPengajuanHonorarium &&
  //   (statusPengajuanHonorarium === "Submitted" ||
  //     statusPengajuanHonorarium === "Revised");
  const [isAllowEditJp, setIsAllowEditJp] = useState(false);
  useEffect(() => {
    const isOnPengajuan =
      proses === "pengajuan" &&
      (!statusPengajuanHonorarium || statusPengajuanHonorarium === "Revise");

    const isOnVerifikasi =
      proses === "verfikasi" &&
      (statusPengajuanHonorarium || false) &&
      (statusPengajuanHonorarium === "Submitted" ||
        statusPengajuanHonorarium === "Revised");
    setIsAllowEditJp(isOnPengajuan || isOnVerifikasi);
    console.log("[check proses]", isOnPengajuan, isOnVerifikasi, isAllowEditJp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proses, statusPengajuanHonorarium]);

  return (
    <div>
      <RowNarasumber text="Nama" value={narasumber.nama} />
      <RowNarasumber
        text="Golongan/Ruang"
        value={narasumber.pangkatGolonganId}
      />
      <RowNarasumber text="Jabatan" value={narasumber.jabatan} />
      <RowNarasumber text="NIK" value={narasumber.id} />
      <RowNarasumber text="NIP" value={narasumber.NIP} />
      <RowNarasumber text="NPWP" value={narasumber.NPWP} />
      <RowNarasumber text="Bank" value={narasumber.bank} />
      <RowNarasumber text="Nama Rekening" value={narasumber.namaRekening} />
      <RowNarasumber text="Nomor Rekening" value={narasumber.nomorRekening} />
      <RowNarasumberWithInput text="lembar konfirmasi">
        <div className="w-full flex justify-between">
          <span>nama file</span>
          <ButtonEye url="/templates/pdf-placeholder.pdf" />
        </div>
      </RowNarasumberWithInput>
      <RowNarasumberWithInput text="Jenis Honorarium">
        <SelectSbmHonorarium
          optionsSbmHonorarium={optionsSbmHonorarium}
          initialOption={selectedSbmHonorarium}
          onChange={handleSbmHonorariumChange}
          isDisabled={!isAllowEditJp}
        />
      </RowNarasumberWithInput>
      <RowNarasumberWithInput text="Jumlah JP">
        <input
          disabled={!isAllowEditJp}
          value={Number(JumlahJP)}
          className="px-2 py-1 w-24"
          min={0.0}
          type="number"
          step={0.1}
          onChange={handleJpChange}
        />
        {isAllowEditJp && (
          <Button className="ml-2" variant={"default"} onClick={handleUpdateJp}>
            Update Jenis dan JP
          </Button>
        )}
      </RowNarasumberWithInput>
      <RowNarasumber
        text="Perkiraan Pembayaran"
        value={formatCurrency(perkiraanPembayaran.honorarium)}
      />
      <RowNarasumber
        text="Perkiraan pajak"
        value={formatCurrency(perkiraanPembayaran.pajak)}
      />
    </div>
  );
};

interface RowNarasumberProps {
  text: string;
  value?: number | string | null;
}
const RowNarasumber = ({ text, value }: RowNarasumberProps) => {
  return (
    <div className="flex flex-row w-full odd:bg-blue-50 p-2">
      <div className="w-1/3">{text}</div>
      <div className="w-2/3">{value}</div>
    </div>
  );
};

const RowNarasumberWithInput = ({
  text,
  children,
  className,
}: {
  text: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="flex flex-row w-full border border-blue-200 h-12 bg-blue-100 p-1">
      <div className="w-1/3">{text}</div>
      <div className="w-2/3 flex">{children}</div>
    </div>
  );
};

const SelectSbmHonorarium = ({
  optionsSbmHonorarium,
  initialOption,
  onChange,
  isDisabled = false,
}: {
  optionsSbmHonorarium: OptionSbm[];
  initialOption: OptionSbm | null;
  onChange: (value: OptionSbm | null) => void;
  isDisabled?: boolean;
}) => {
  const [selectedOption, setSelectedOption] = useState<OptionSbm | null>(
    initialOption
  );

  const handleChange = (
    newValue: SingleValue<OptionSbm>,
    actionMeta: ActionMeta<OptionSbm>
  ) => {
    console.log("Selected option:", newValue);
    // You can access extra attributes here
    if (newValue) {
      console.log("Selected besaran:", newValue.besaran);
      console.log("Selected id:", newValue.value);
    }
    setSelectedOption(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    setSelectedOption(initialOption);
  }, [initialOption]);

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={optionsSbmHonorarium}
      isDisabled={isDisabled}
      formatOptionLabel={(option: OptionSbm) => (
        <div>
          {option.label}
          <span style={{ color: "gray", marginLeft: "5px" }}>
            {option.besaran?.toString()}
          </span>
          <span style={{ color: "gray", marginLeft: "5px" }}>
            {option.satuan?.toString()}
          </span>
        </div>
      )}
      getOptionValue={(option: OptionSbm) => option.value.toString()}
      className="w-full"
    />
  );
};

export default NarasumberDetail;
