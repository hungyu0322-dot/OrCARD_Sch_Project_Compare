
import { Part, Meta, Stats, Pin } from '../types';
import { classifyPart } from './classifiers';

export const parseOrCADJson = (json: any, encoding: string): { parts: Part[], meta: Meta, stats: Stats } => {
  let schematicList: any[] = [];
  let meta: Meta = { name: '', version: '', encoding };
  const rawPinCount = parseInt(json.pin_count || "0", 10);

  if (json.objDsn && json.objDsn.lstSche) {
    schematicList = json.objDsn.lstSche;
    meta = { name: json.objDsn.Name, version: json.version, encoding };
  } else if (json.lstSche) {
    schematicList = json.lstSche;
    meta = { name: "Standard Export", version: json.version, encoding };
  } else if (json.lstPage) {
    schematicList = [{ Name: "Single", lstPage: json.lstPage }];
    meta = { name: "Single Page", version: json.version, encoding };
  }

  const parts: Part[] = [];
  const globalNetSet = new Set<string>();

  schematicList.forEach(sche => {
    if (!sche.lstPage) return;
    sche.lstPage.forEach((page: any) => {
      if (!page.lstPart) return;
      page.lstPart.forEach((part: any) => {
        const pn = (part.Part_Number || part.PART_NUMBER || "N/A").trim();
        const value = part.Value || part.VALUE || "";
        const footprint = part["PCB Footprint"] || part.PCB_Footprint || "";
        const isNL = value.toUpperCase().includes("NL") || 
                    value.toUpperCase().includes("DNI") || 
                    footprint.toUpperCase().includes("DNI");

        const pins: Pin[] = [];
        const connectedNets = new Set<string>();
        
        if (part.lstPin && Array.isArray(part.lstPin)) {
           part.lstPin.forEach((pin: any) => {
               const netName = pin.objNet?.["Net Name"] || "";
               if (netName && netName !== "NC") {
                   pins.push({ num: pin.Number, name: pin.Name, net: netName });
                   connectedNets.add(netName);
                   globalNetSet.add(netName);
               }
           });
        }

        parts.push({
          ref: part.Reference || part.Part_Reference || "Unk",
          pn,
          value,
          schematic: sche.Name,
          page: page.Name,
          footprint,
          isNL,
          classification: classifyPart(pn),
          pins,
          nets: Array.from(connectedNets).sort()
        });
      });
    });
  });

  const stats: Stats = { parts: parts.length, pins: rawPinCount, nets: globalNetSet.size };
  return { parts, meta, stats };
};
