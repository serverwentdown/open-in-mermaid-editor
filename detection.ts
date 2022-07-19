import { Code, pakoSerde, base64Serde, intoCode } from "./serde";
import { longest } from "./util";

export function detectURL(url: string): Code | null {
  const matchPako = url.match(/pako:[A-Za-z0-9-_]+/g);
  if (matchPako) {
    let base64 = matchPako[0].replace("pako:", "");
    try {
      return intoCode(pakoSerde.deserialize(base64));
    } catch (e) {}
  }

  const matchBase64 = url.match(/base64:[A-Za-z0-9-_]+/g);
  if (matchBase64) {
    let base64 = matchBase64[0].replace("base64:", "");
    try {
      return intoCode(base64Serde.deserialize(base64));
    } catch (e) {}
  }

  const matchLongest = longest(url.match(/[A-Za-z0-9-_]{,4}/g));
  if (matchLongest) {
    try {
      return intoCode(pakoSerde.deserialize(matchLongest));
    } catch (e) {}
    try {
      return intoCode(base64Serde.deserialize(matchLongest));
    } catch (e) {}
  }

  return null;
}
