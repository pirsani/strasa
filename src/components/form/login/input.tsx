import { FieldError, UseFormRegister } from "react-hook-form";

interface InputProps {
  id: string;
  label: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError | undefined;
  pattern?: string;
}

const Input = ({ id, label, type = "text", register, error }: InputProps) => {
  return (
    <div className="relative group">
      <input
        id={id}
        type={type}
        {...register(id)}
        required
        className="form-control block w-full h-[4em] px-4 py-5 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-sm  m-0 focus:text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none peer"
      />
      <label
        htmlFor={id}
        className="transform transition-all absolute top-4 ml-4 text-muted-foreground
        peer-valid:-top-3 peer-valid:text-sm 
        group-focus-within:-top-3 group-focus-within:text-sm
        group-focus-within:text-blue-500 peer-valid:bg-white 
        group-focus-within:bg-white
        peer-valid:px-2 group-focus-within:px-2
        "
      >
        {label}
      </label>
      {error && <span className="text-red-500">{error.message}</span>}
    </div>
  );
};

export default Input;
