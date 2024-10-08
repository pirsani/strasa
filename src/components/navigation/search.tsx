"use client";

import { ListFilter, SearchIcon } from "lucide-react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import SearchInput from "./search-input";

const Search = () => {
  const methods = useForm<FieldValues>({
    defaultValues: {
      search: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: FieldValues) => {
    console.log(data);
    console.log("submitting");
  };

  return (
    <div
      className="
        border-2     
        w-full lg:w-1/2        
        md:py-2
        md:rounded-2xl
        shadow-sm
        hover:shadow-sm
        transition
        cursor-pointer
        bg-muted
        focus-within:bg-white
        focus-within:text-zinc-600
        "
    >
      <div className="flex flex-row items-center justify-between w-full">
        <div
          className="
            text-sm
            px-2
            flex
            flex-row
            items-center
            gap-3
            grow
            "
        >
          <div className="md:p-2 rounded-full text-inherit">
            <SearchIcon size={24} />
          </div>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <SearchInput id="search" onSearch={handleSubmit(onSubmit)} />
            </form>
          </FormProvider>

          <div className="p-2 rounded-full text-inherit hidden md:block">
            <ListFilter size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
