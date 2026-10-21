export const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
export const isValidUsername = (value = "") => /^[\p{L}\p{N}@./+_-]+$/u.test(value.trim());

export const isValidPhone = (value = "") => {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.length <= 15 && /^\+?[\d\s().-]+$/.test(trimmed) && digits.length >= 7 && digits.length <= 15;
};

export const getApiErrorMessage = (error, fallback = "Request failed. Check the form and try again.") => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  const firstMessage = data && Object.values(data).flat(Infinity).find((value) => typeof value === "string");
  return firstMessage || fallback;
};
