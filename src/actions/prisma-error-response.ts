import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import { Logger } from "tslog";
import { ErrorResponse } from "./response";
const logger = new Logger({
  hideLogPositionForProduction: true,
});

export const getPrismaErrorResponse = (
  error: Error,
  text?: string
): ErrorResponse => {
  const dataText = text ? text : `Data`;
  logger.error(error);
  const customError = error as CustomPrismaClientError;
  switch (customError.code) {
    case `P2000`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} The provided value for the column is too long for the column's type`,
      };
      break;
    case `P2001`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} The record searched for does not exist`,
      };
      break;
    case `P2002`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} The record already exists`,
      };
      break;
    case `P2003`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} is being referenced by other data`,
      };
      break;
    case `P2004`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} A constraint failed`,
      };
      break;
    case `P2005`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText}  The value stored in the database for the field is invalid for the field's type`,
      };
      break;
    case `P2006`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} The provided value is not valid`,
      };
      break;
    case `P2007`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Data validation error`,
      };
      break;
    case `P2008`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Failed to parse the query`,
      };
      break;
    case `P2009`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Failed to validate the query`,
      };
      break;
    case `P2010`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} query failed`,
      };
      break;
    case `P2011`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Null constraint violation`,
      };
      break;
    case `P2012`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Missing a required value`,
      };
      break;
    case `P2013`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Missing the required argument`,
      };
      break;
    case `P2015`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} A related record could not be found`,
      };
      break;
    case `P2018`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} The required connected records were not found`,
      };
      break;
    case `P2019`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Input error`,
      };
      break;
    case `P2020`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} Value out of range for the type`,
      };
      break;
    case `P2021`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} does not exist in the current database.`,
      };
      break;
    case `P2022`:
      return {
        success: false,
        error: customError.code,
        message: `${dataText} The column does not exist in the current database.`,
      };
      break;
    case `P2025`:
      return {
        success: false,
        error: `${dataText} not found`,
        message: `${dataText} not found`,
      };
      break;
    case `P2037`:
      return {
        success: false,
        error: customError.code,
        message: `Too many database connections opened`,
      };
      break;
    default:
      break;
  }
  return {
    success: false,
    error: customError.code,
    message: customError.message,
  };
};
