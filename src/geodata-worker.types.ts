
import type { StatPopRowType } from "./StatPopRowType";

export interface WorkerRequest {
  type: "get-features";
  payload: GetFeaturesParams;
}

export interface WorkerResponse {
  type: "result";
  result: PolygonData[];
}
export type PolygonData = {
  poligonCoordinate:number[][],
  pNum:number,
  color:string
}

export type GetFeaturesParams = {
  gender: string,
  lowerColLimit: number,
  upperColLimit: number,
  transparence: number
}
