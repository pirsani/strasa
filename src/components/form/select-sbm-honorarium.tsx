import { OptionSbm } from "@/actions/sbm";
import { useEffect, useState } from "react";
import Select, { ActionMeta, SingleValue } from "react-select";

interface SelectSbmHonorariumProps {
  inputId: string;
  optionsSbmHonorarium: OptionSbm[];
  initialOption: OptionSbm | null;
  onChange: (value: OptionSbm | null) => void;
  isDisabled?: boolean;
}

export const SelectSbmHonorarium = ({
  inputId = "jenisHonorariumId",
  optionsSbmHonorarium,
  initialOption,
  onChange,
  isDisabled = false,
}: SelectSbmHonorariumProps) => {
  const [selectedOption, setSelectedOption] = useState<OptionSbm | null>(
    initialOption
  );

  // console.debug("initialOption", initialOption);
  // console.debug("selectedOption", selectedOption);

  const handleChange = (
    newValue: SingleValue<OptionSbm>,
    actionMeta: ActionMeta<OptionSbm>
  ) => {
    // console.debug("Selected option:", newValue);
    // You can access extra attributes here
    if (newValue) {
      // console.debug("Selected besaran:", newValue.besaran);
      // console.debug("Selected id:", newValue.value);
    }
    setSelectedOption(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    setSelectedOption(initialOption);
  }, [initialOption]);

  return (
    <Select
      inputId={inputId}
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

export default SelectSbmHonorarium;
