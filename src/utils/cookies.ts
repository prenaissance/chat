type Cookies = Partial<Record<string, string>>;

export const parseCookies = (cookieHeader: string): Map<string, string> =>
  cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) {
      acc.set(key.trim(), value.trim());
    }
    return acc;
  }, new Map<string, string>());

export const parseCookiesObject = (cookieHeader: string): Cookies =>
  Object.fromEntries(parseCookies(cookieHeader).entries());
