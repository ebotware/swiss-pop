
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
  extent: number[];
}

export type GetFeaturesParams = {
  gender: string,
  lowerColLimit: number,
  upperColLimit: number,
  transparence: number
}
