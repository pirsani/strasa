"use client";
import { useSearchTerm } from "@/hooks/use-search-term";
import { debounce } from "lodash";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

interface SearchInputProps {
  id: string;
  onSearch?: () => void;
}

const SearchInput = ({ id, onSearch }: SearchInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { setTerm } = useSearchTerm();
  const [inputValue, setInputValue] = useState(""); // Separate state for input value

  // Use useRef to create a stable reference to the debounced function
  const debouncedSetTermRef = useRef(
    debounce((value: string) => {
      setTerm(value);
    }, 300)
  );

  // Cleanup the debounced function on component unmount
  useEffect(() => {
    const debouncedSetTerm = debouncedSetTermRef.current;
    return () => {
      debouncedSetTerm.cancel();
    };
  }, []);

  // Use the debounced function from the ref
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debouncedSetTermRef.current(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch && onSearch();
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setTerm("");
  };

  return (
    <div className="relative flex items-center w-full">
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <input
            id={id}
            {...field}
            onKeyDown={handleKeyDown}
            type="text"
            className="w-full p-2 rounded-none border-none focus:ring-0 focus:outline-none bg-muted focus:bg-white"
            onChange={(e) => {
              field.onChange(e);
              handleChange(e);
            }}
            value={inputValue} // Bind value to inputValue
          />
        )}
      />
      {inputValue && inputValue.length > 0 && (
        <X
          className="absolute right-2 cursor-pointer text-gray-500"
          onClick={handleClear}
        />
      )}
    </div>
  );
};

export default SearchInput;
