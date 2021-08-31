import { storageKey } from "./store/user";

const apiUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/api/"
    : "/api/";

export const fetchApi = async <T>(
  route: string,
  ...params: string[]
): Promise<T> => {
  const paramString = params.length > 0 ? "?" + params.join("&") : "";

  const url = apiUrl + route + paramString;

  const token = localStorage.getItem(storageKey) ?? "";

  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(
    (res) => res.json()
  );
};
