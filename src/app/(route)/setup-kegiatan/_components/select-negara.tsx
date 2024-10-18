"use client";
import { getOptionsNegara } from "@/actions/negara";
import { cn } from "@/lib/utils";
import { randomStrimg } from "@/utils/random-string";
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SelectNegaraProps {
  fieldName: string;
  onChange?: (value: Option | null) => void;
  value?: Option | null;
  className?: string;
}

const SelectNegara = ({
  fieldName,
  onChange = () => {},
  value = null,
  className,
}: SelectNegaraProps) => {
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const optionNegara = await getOptionsNegara();
      if (optionNegara) {
        const mappedOptions = optionNegara.map((negara) => ({
          value: negara.value,
          label: negara.label,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  const genId = randomStrimg(5);
  return (
    <Select
      instanceId={`${fieldName}-${genId}`}
      id={`${fieldName}-${genId}`}
      options={options}
      isClearable
      onChange={
        (option: SingleValue<Option>) =>
          //onChange(option ? option.value : null)
          onChange(option ? option : null) // return object instead of value
      }
      //value={options.find((option) => option.value === value) || null}
      value={value || null} // Ensure value is an Option object or null
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value.toString()}
      filterOption={(option, inputValue) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      }
      // styles={{
      //   menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      // }}
      className={cn("w-full", className)}
      aria-labelledby={`${fieldName}-${genId}`}
    />
  );
};

export default SelectNegara;
