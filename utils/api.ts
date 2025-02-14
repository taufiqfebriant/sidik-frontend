import ky from "ky";

export const api = ky.create({
  prefixUrl: process.env.API_URL || "http://localhost:8000",
  credentials: "include",
  headers: {
    Accept: 'application/json',
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const xsrfCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="));

        if (xsrfCookie) {
          const token = xsrfCookie.split("=")[1];
          request.headers.set("X-XSRF-TOKEN", decodeURIComponent(token));
        }
      },
    ],
  },
});
