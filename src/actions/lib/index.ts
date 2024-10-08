import { ErrorResponse } from "@/actions/response";
import { Prisma } from "@/lib/db-honorarium";
import { ZodError } from "zod";

export const ErrorResponseSwitcher = (error: unknown): ErrorResponse => {
  if (error instanceof ZodError) {
    console.error("Validation Error in saveFileToFinalFolder:", error.errors);
    return {
      success: false,
      error: "Validation Error",
      message: "Invalid data format",
    };
  } else if (error instanceof Error && error.message.includes("ENOENT")) {
    console.error("File System Error in saveFileToFinalFolder:", error.message);
    return {
      success: false,
      error: "File System Error",
      message: "Error handling file system operations",
    };
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Database Error in saveFileToFinalFolder:", error.message);
    return {
      success: false,
      error: "Database Error",
      message: "Error querying the database",
    };
  } else {
    console.error("Unknown Error in saveFileToFinalFolder:", error);
    return {
      success: false,
      error: "Unknown Error",
      message: "An unknown error occurred",
    };
  }
};
