export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  } else {
    try {
      return JSON.stringify(error);
    } catch (error) {
      return "Unknown error";
    }
  }
}
