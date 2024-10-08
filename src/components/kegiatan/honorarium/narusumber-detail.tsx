import { OptionSbm } from "@/actions/sbm";
import ButtonEye from "@/components/button-eye-open-document";
import formatCurrency from "@/utils/format-currency";
import { JadwalNarasumber, Narasumber } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { useEffect, useMemo, useState } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";

interface PerkiraanPembayaran {
  pajak: Decimal;
  honorarium: Decimal;
}

interface NarasumberDetailProps {
  narasumber: Narasumber;
  jadwalNarasumber: JadwalNarasumber;
  optionsSbmHonorarium?: OptionSbm[];
}

const NarasumberDetail = ({
  narasumber,
  jadwalNarasumber,
  optionsSbmHonorarium = [],
}: NarasumberDetailProps) => {
  const [perkiraanPembayaran, setPerkiraanPembayaran] =
    useState<PerkiraanPembayaran>({
      pajak: new Decimal(0),
      honorarium: new Decimal(0),
    });
  const [JumlahJP, setJumlahJP] = useState<Decimal>(
    jadwalNarasumber.jumlahJamPelajaran || new Decimal(0)
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
      setSelectedSbmHonorarium(defaultOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //const sbm: Decimal = new Decimal(1700000); // dari tabel referensi sbm_honorarium
  const besaranPajak = useMemo(() => new Decimal(0.05), []);

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
      setPerkiraanPembayaran({
        pajak: JumlahJP.times(sbm).times(besaranPajak),
        honorarium: JumlahJP.times(sbm),
      });
    }
  }, [JumlahJP, selectedSbmHonorarium, besaranPajak]);

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
      <RowNarasumber text="Kelas" value={`Kelas X`} />
      <RowNarasumber text="Materi" value={`Materi Y`} />
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
        />
      </RowNarasumberWithInput>
      <RowNarasumberWithInput text="Jumlah JP">
        <input
          className="px-2 py-1 w-24"
          min={0.5}
          type="number"
          step={0.1}
          onChange={handleJpChange}
        />
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
}: {
  text: string;
  children: React.ReactNode;
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
}: {
  optionsSbmHonorarium: OptionSbm[];
  initialOption: OptionSbm | null;
  onChange: (value: OptionSbm | null) => void;
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

  return (
    <Select
      value={selectedOption}
      onChange={handleChange}
      options={optionsSbmHonorarium}
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
