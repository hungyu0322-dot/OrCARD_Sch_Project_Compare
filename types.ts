
export interface Classification {
  type: string;
  color: string;
  priority: number;
}

export interface Pin {
  num: string;
  name: string;
  net: string;
}

export interface Part {
  ref: string;
  pn: string;
  value: string;
  schematic: string;
  page: string;
  footprint: string;
  isNL: boolean;
  classification: Classification;
  pins: Pin[];
  nets: string[];
}

export interface Meta {
  name: string;
  version: string;
  encoding: string;
}

export interface Stats {
  parts: number;
  pins: number;
  nets: number;
}

export interface NetConnection {
  ref: string;
  pinNum: string;
  pinName: string;
  partType: string;
  pn: string;
  value: string;
  footprint: string;
}

export interface NetObject {
  name: string;
  pins: NetConnection[];
  pages: Set<string>;
  signature?: string;
}

export interface NetMismatch {
  name: string;
  old: NetObject;
  new: NetObject;
}

export interface NetCompareResults {
  mismatch: NetMismatch[];
  added: NetObject[];
  deleted: NetObject[];
  unconnected: NetObject[];
  stats: {
    mismatch: number;
    added: number;
    deleted: number;
    unconnected: number;
  };
}

export interface CompDiff {
  ref: string;
  page: string;
  old: Part;
  new: Part;
}

export interface CompCompareResults {
  added: Part[];
  removed: Part[];
  footprintDiff: CompDiff[];
  valueDiff: CompDiff[];
  pnDiff: CompDiff[];
  stats: {
    added: number;
    removed: number;
    footprintDiff: number;
    valueDiff: number;
    pnDiff: number;
  };
}
