import { auth } from "@/auth";

export type {
  ActionResponse,
  ErrorResponse,
  SuccessResponse,
} from "./response";

// Function to convert FormData to a plain object
// When FormData is serialized, if there's no file or the field is empty, it's commonly set as an empty string (""), but sometimes frameworks will serialize the value as the string "undefined". This string is not the same as the undefined type in JavaScript. This function will convert the FormData object to a plain object, replacing the string "undefined" with the actual undefined type.
export const formDataToObject = (formData: FormData) => {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    // Check if the value is the string "undefined"
    if (value === "undefined") {
      obj[key] = undefined; // Assign undefined if the value is the string "undefined"
    } else {
      obj[key] = value; // Otherwise, assign the value
    }
  });
  return obj;
};

export const getUserId = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return null;
  }
  return session.user.id;
};
