import { ZodError } from "zod";

interface ZodErrorListProps {
  error: ZodError;
}

const ZodErrorList = ({ error }: ZodErrorListProps) => {
  return (
    <div className="bg-red-500 text-white p-2">
      <ul>
        {error.errors.map((err, index) => (
          <li key={index} className="error-item">
            {err.path.join(".")} - {err.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ZodErrorList;
