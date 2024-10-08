import {
  FieldError,
  FieldErrors,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from "react-hook-form";

type CummulativeErrorsProps<T extends FieldValues> = {
  errors: FieldErrors<T>;
};

const CummulativeErrors = <T extends FieldValues>({
  errors,
}: CummulativeErrorsProps<T>) => {
  const hasErrors = Object.keys(errors).length > 0;

  if (!hasErrors) return null;

  const getMessage = (
    error:
      | string
      | FieldError
      | Merge<FieldError, FieldErrorsImpl<any>>
      | Record<string, any>
      | undefined
  ): string => {
    // Handle if the error is a direct string
    if (typeof error === "string") {
      return error;
    }

    // Handle FieldError or Merge types with a message property
    if (error && "message" in error && typeof error.message === "string") {
      return error.message;
    }

    // Handle nested error messages for array or object-like structures
    if (typeof error === "object" && error !== null && !("message" in error)) {
      const firstKey = Object.keys(error)[0];

      if (firstKey && (error as Record<string, any>).hasOwnProperty(firstKey)) {
        const potentialError = (error as Record<string, any>)[firstKey];

        // Ensure potentialError is an object with a 'message' property
        if (
          potentialError &&
          typeof potentialError === "object" &&
          "message" in potentialError &&
          typeof potentialError.message === "string"
        ) {
          return potentialError.message;
        }
      }
    }

    return "Unknown error"; // Fallback if no message found
  };

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Ada kesalahan dalam pengisian form:</strong>
      <ul className="list-disc list-inside">
        {Object.entries(errors).map(([key, value]) => (
          <li key={key}>{getMessage(value)}</li>
        ))}
      </ul>
    </div>
  );
};

export default CummulativeErrors;
