import { inflate, deflate } from "pako";
import { toUint8Array, fromUint8Array, toBase64, fromBase64 } from "js-base64";

export interface LiveGistLoaderConfig {
  url: string;
}

export interface LiveFileLoaderConfig {
  codeURL: string;
  configURL?: string;
}

export interface LiveLoaderConfig {
  type: "gist" | "files";
  config: LiveGistLoaderConfig | LiveFileLoaderConfig;
}

export interface LiveState {
  code: string;
  mermaid?: string;
  updateEditor?: boolean;
  updateDiagram?: boolean;
  autoSync?: boolean;
  loader?: LiveLoaderConfig;
}

export interface Serde {
  serialize(state: string): string;
  deserialize(state: string): string;
}

export const base64Serde: Serde = {
  serialize: (state) => {
    return toBase64(state, true);
  },
  deserialize: (state) => {
    return fromBase64(state);
  },
};

export const pakoSerde: Serde = {
  serialize: (state) => {
    const data = new TextEncoder().encode(state);
    const compressed = deflate(data, { level: 9 });
    return fromUint8Array(compressed, true);
  },
  deserialize: (state) => {
    const data = toUint8Array(state);
    return inflate(data, { to: "string" });
  },
};

export type Code = LiveState | string;

export function intoCode(data: string): Code {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

export function fromCode(code: Code): string {
  if (typeof code === "string") {
    return code;
  } else {
    return JSON.stringify(code);
  }
}

export function asLiveState(code: Code): LiveState {
  if (typeof code === "string") {
    const mermaidConfig = { theme: "default" };
    return { code: code, mermaid: JSON.stringify(mermaidConfig) };
  } else {
    return code;
  }
}

export function getSource(code: Code): string {
  if (typeof code === "string") {
    return code;
  } else {
    return code.code;
  }
}
