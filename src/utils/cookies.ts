export const parseCookies = (cookieHeader: string): Map<string, string> =>
  cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) {
      acc.set(key.trim(), value.trim());
    }
    return acc;
  }, new Map<string, string>());
