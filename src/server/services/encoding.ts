export const urlEncodedToBuffer = (urlEncoded: string) => {
  const header = urlEncoded.match(/^data:.*;base64,/);
  if (!header) {
    throw new URIError("Not a base64 encoded string");
  }
  const base64 = urlEncoded.replace(header[0], "");
  return Buffer.from(base64, "base64");
};
