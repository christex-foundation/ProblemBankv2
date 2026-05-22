import responsesJson from "@/data/responses.json";
import universeJson from "@/data/universe-layout.json";
import mapJson from "@/data/map-layout.json";
import type { SurveyResponse } from "./types";
import type { Universe } from "./universe";

export function loadResponses(): SurveyResponse[] {
  return responsesJson as unknown as SurveyResponse[];
}

export function loadUniverse(): Universe {
  return universeJson as unknown as Universe;
}

export function loadMapUniverse(): Universe {
  return mapJson as unknown as Universe;
}
