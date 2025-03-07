"use client";
import { updateNarasumberLk } from "@/actions/honorarium/narasumber/narasumber";
import { updateJumlahJpJadwalNarasumber } from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import { OptionSbm } from "@/actions/sbm";
import ButtonEye from "@/components/button-eye-open-document";
import InputFileImmediateUpload from "@/components/form/input-file-immediate-upload";
import { Button } from "@/components/ui/button";
import useFileStore from "@/hooks/use-file-store";
import { getBesaranPajakHonorarium } from "@/lib/pajak";
import { cn } from "@/lib/utils";
import formatCurrency from "@/utils/format-currency";
import { randomStrimg } from "@/utils/random-string";
import { createId } from "@paralleldrive/cuid2";
import {
  ALUR_PROSES,
  JadwalNarasumber,
  Narasumber,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { LoaderPinwheel } from "lucide-react";
import { useEffect, useState } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";
import { toast } from "sonner";

interface PerkiraanPembayaran {
  pajak: Decimal;
  honorarium: Decimal;
}

interface NarasumberDetailProps {
  kegiatanId?: string | null;
  narasumber: Narasumber;
  jadwalNarasumber: JadwalNarasumber;
  optionsSbmHonorarium?: OptionSbm[];
  proses?: ALUR_PROSES | null;
  statusPengajuanHonorarium?: STATUS_PENGAJUAN | null;
}

const NarasumberDetail = ({
  kegiatanId,
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
    console.debug("useEffect jadwalNarasumber", jadwalNarasumber);
    if (jadwalNarasumber.jenisHonorariumId !== null) {
      console.debug("jenisHonorariumId", jadwalNarasumber.jenisHonorariumId);
      console.debug("DND01_a optionsSbmHonorarium", optionsSbmHonorarium);
      const defaultOption =
        optionsSbmHonorarium.find(
          (option) => option.value === jadwalNarasumber.jenisHonorariumId
        ) || null;
      //console.debug("defaultOption", defaultOption);
      setSelectedSbmHonorarium(defaultOption);
    }
    //console.debug("selectedSbmHonorarium", jadwalNarasumber.jenisHonorariumId);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jadwalNarasumber, optionsSbmHonorarium]);

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
  const [isChanged, setIsChanged] = useState(false);
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
    setIsChanged(true);
  };

  const handleSbmHonorariumChange = (selected: OptionSbm | null) => {
    console.debug("Selected sbm honorarium:", selected);
    setSelectedSbmHonorarium(selected);
    setIsChanged(true);
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

  const [isUpdatingJp, setIsUpdatingJp] = useState(false);
  const handleUpdateJp = async () => {
    if (proses === "PENGAJUAN" || proses === "VERIFIKASI") {
      // update JP dan update jenis honorarium
      setIsUpdatingJp(true);
      const jenisHonorariumId = selectedSbmHonorarium?.value || null;
      const jumlahJamPelajaran = JumlahJP.toNumber();
      const updatedJadwalNarasumber = await updateJumlahJpJadwalNarasumber(
        jadwalNarasumber.id,
        jumlahJamPelajaran,
        jenisHonorariumId
      );
      if (!updatedJadwalNarasumber.success) {
        toast.error(
          `Gagal memperbarui JP dan Jenis Honorarium ${updatedJadwalNarasumber.message}`
        );
        return;
      } else {
        setIsChanged(false);
        toast.success("JP dan Jenis Honorarium diperbarui");
      }
      setIsUpdatingJp(false);
    }
  };

  // jumlah JP dan jenis honorarium hanya bisa dilakukan jika isOnPengajuan isOnVerifikasi bernilai true

  const [isAllowEditJp, setIsAllowEditJp] = useState(false);
  const [isUploadLkAllowed, setIsUploadLkAllowed] = useState(false);
  const [showInputUploadLk, setShowInputUploadLk] = useState(false);
  useEffect(() => {
    const isOnPengajuan =
      proses === "PENGAJUAN" &&
      (!statusPengajuanHonorarium || statusPengajuanHonorarium === "REVISE");

    setIsUploadLkAllowed(isOnPengajuan);

    const isOnVerifikasi =
      proses === "VERIFIKASI" &&
      (statusPengajuanHonorarium || false) &&
      (statusPengajuanHonorarium === "SUBMITTED" ||
        statusPengajuanHonorarium === "REVISED");
    setIsAllowEditJp(isOnPengajuan || isOnVerifikasi);
    console.debug(
      "[check proses]",
      isOnPengajuan,
      isOnVerifikasi,
      isAllowEditJp
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proses, statusPengajuanHonorarium]);

  const { setFileUrl } = useFileStore();

  const genId = randomStrimg(5);
  const cuid = createId() + ".pdf";

  const [cuidUpload, setCuidUpload] = useState<string | null>(null);
  const handleFileUploadDokumenKonfirmasiCompleted = (
    name: string,
    file?: File | null
  ) => {
    if (!file) return;

    setCuidUpload(cuid);

    console.log("File uploaded", cuid);
    // get url from uploaded file
    const url = URL.createObjectURL(file);
    setFileUrl(url);
  };

  const handleOnFileChange = (file: File | null, cuid?: string) => {
    if (!file) {
      console.log(`File ${cuid} is removed`);
      // Remove file from list of dokumenKonfirmasiNarasumber
      setFileUrl(null);
    }
  };

  const handleSimpanPerubahanLk = async () => {
    if (!cuidUpload) {
      toast.error("File konfirmasi kesediaan mengajar belum diupload");
      return;
    }
    const simpan = await updateNarasumberLk(cuidUpload, {
      id: jadwalNarasumber.id,
      jadwalId: jadwalNarasumber.jadwalId,
    });

    if (simpan.success) {
      toast.success("Lembar konfirmasi berhasil disimpan");
      setShowInputUploadLk(false);
    }
  };

  return (
    <div id={`CKHND-Narasumber-${genId}`}>
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
      <RowNarasumberWithInput text="Lembar konfirmasi" className="">
        {isUploadLkAllowed && (
          <>
            {showInputUploadLk && (
              <InputFileImmediateUpload
                className=""
                cuid={cuid}
                folder={kegiatanId + "/" + jadwalNarasumber.jadwalId}
                name={"narsumLabel"}
                onFileUploadComplete={
                  handleFileUploadDokumenKonfirmasiCompleted
                }
                //onFileChange={handleOnFileChange}
              />
            )}
            <Button
              variant={"outline"}
              onClick={() => setShowInputUploadLk(!showInputUploadLk)}
            >
              {showInputUploadLk ? "Batal" : "Ganti"}
            </Button>
            {showInputUploadLk && (
              <Button onClick={handleSimpanPerubahanLk}>Simpan</Button>
            )}
          </>
        )}
        {!showInputUploadLk && (
          <LembarKonfirmasi jadwalNarasumber={jadwalNarasumber} cuid={cuid} />
        )}
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
          className="px-2 py-1 w-16"
          min={0.0}
          type="number"
          step={0.1}
          onChange={handleJpChange}
        />
        {isAllowEditJp && isChanged && (
          <Button
            className="ml-2"
            variant={"default"}
            onClick={handleUpdateJp}
            disabled={isUpdatingJp}
          >
            Update Jenis dan JP{" "}
            {isUpdatingJp ? <LoaderPinwheel className="animate-spin" /> : ""}
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

interface LembarKonfirmasiProps {
  jadwalNarasumber: JadwalNarasumber;
  cuid: string;
}
const LembarKonfirmasi = ({
  jadwalNarasumber,
  cuid,
}: LembarKonfirmasiProps) => {
  const lk = jadwalNarasumber.dokumenKonfirmasiKesediaanMengajar;
  const id = jadwalNarasumber.id;
  const narasumberId = jadwalNarasumber.narasumberId;

  if (lk && lk !== "")
    return (
      <div className="flex flex-row justify-end">
        <ButtonEye
          url={`/download/konfirmasi-kesediaan-mengajar/${narasumberId}/${id}`}
        />
      </div>
    );
  else return null;

  // if (!lk || lk === "") {
  //   return (
  //     <>
  //       <InputFileImmediateUpload
  //         cuid={cuid}
  //         folder={jadwalNarasumber.narasumberId}
  //         name="dokumenKonfirmasiKesediaanMengajar"
  //       />
  //     </>
  //   );
  // } else {
  //   <ButtonEye url="/templates/pdf-placeholder.pdf" />;
  // }
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
    <div
      className={cn(
        "flex flex-row w-full border border-blue-200 h-12 bg-blue-100 justify-center items-center pl-2",
        className
      )}
    >
      <div className="w-1/3">{text}</div>
      <div className="w-2/3 flex items-center gap-1">{children}</div>
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

  console.debug("initialOption", initialOption);
  console.debug("selectedOption", selectedOption);

  const handleChange = (
    newValue: SingleValue<OptionSbm>,
    actionMeta: ActionMeta<OptionSbm>
  ) => {
    console.debug("Selected option:", newValue);
    // You can access extra attributes here
    if (newValue) {
      console.debug("Selected besaran:", newValue.besaran);
      console.debug("Selected id:", newValue.value);
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
