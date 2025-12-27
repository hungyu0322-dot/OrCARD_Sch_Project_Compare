
import { GoogleGenAI, Type } from "@google/genai";
import { NetCompareResults, CompCompareResults } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSchematicDiffs(
  netDiff: NetCompareResults,
  compDiff: CompCompareResults
) {
  const summary = {
    netMismatches: netDiff.stats.mismatch,
    addedNets: netDiff.stats.added,
    removedNets: netDiff.stats.deleted,
    addedComps: compDiff.stats.added,
    removedComps: compDiff.stats.removed,
    footprintChanges: compDiff.stats.footprintDiff,
    valueChanges: compDiff.stats.valueDiff,
    pnChanges: compDiff.stats.pnDiff,
  };

  const topMismatches = netDiff.mismatch.slice(0, 5).map(m => m.name);
  const topFootprints = compDiff.footprintDiff.slice(0, 5).map(f => `${f.ref}: ${f.old.footprint} -> ${f.new.footprint}`);

  const prompt = `
    As a Senior Electrical Hardware Engineer, analyze these schematic design revision changes.
    Summary of Diffs: ${JSON.stringify(summary)}
    Key Net Mismatches: ${topMismatches.join(', ')}
    Key Footprint Changes: ${topFootprints.join(', ')}

    Provide a professional analysis in JSON format focusing on:
    1. Criticality (Low, Medium, High)
    2. Potential Design Risks (e.g., Signal Integrity, Power Delivery, Mechanical conflicts)
    3. Actionable Recommendations for the engineering team.
  `;

  try {
    // Using gemini-3-pro-preview for complex hardware engineering reasoning tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            criticality: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            analysis: { type: Type.STRING },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["criticality", "riskLevel", "analysis", "risks", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
}
