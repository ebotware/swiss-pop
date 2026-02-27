import OLMap from 'ol/Map';

import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Style } from 'ol/style';
import type { GetFeaturesParams, PolygonData, WorkerRequest, WorkerResponse } from './geodata-worker.types';

export type CRD = {
  lat: number,
  lng: number,
  tot: number
}


export class OpenLayersLayerManager {
  vectorLayer: VectorLayer | null = null;
  map: OLMap;
  worker;
  constructor(map: OLMap) {
    this.map = map;
    this.worker = new Worker(
      new URL("./geodata.worker.ts", import.meta.url),
      { type: "module" }
    );

  }

  async getFeatures(params: GetFeaturesParams): Promise<PolygonData[]> {
    return new Promise((resolve) => {
      const message: WorkerRequest = {
        type: "get-features",
        payload: params
      };
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        resolve(event.data.result);
      }
      console.log("Posting massage")
      this.worker.postMessage(message);
    })
  }
  buildFeaturesInChunks(
    data: PolygonData[],
    source: VectorSource,
    chunkSize = 2000
  ): Promise<void> {

    return new Promise((resolve) => {

      let index = 0;

      const processChunk = () => {
        const end = Math.min(index + chunkSize, data.length);
        const chunkFeatures: Feature[] = [];

        for (; index < end; index++) {
          const polygon = data[index];

          const square = new Polygon([polygon.poligonCoordinate]);

          const feature = new Feature({
            geometry: square,
            info: polygon.pNum
          });

          feature.set("color", polygon.color);

          chunkFeatures.push(feature);
        }

        source.addFeatures(chunkFeatures);

        if (index < data.length) {
          requestAnimationFrame(processChunk);
        } else {
          resolve();
        }
      };

      processChunk();
    });
  }
  async loadMapData(agemin: number, agemax: number, gender: string, transparence: number) {
    if (isNaN(agemin)) throw ("agemin NaN")
    if (isNaN(agemax)) throw ("agemax NaN")

    let lowerColLimit = Math.trunc(agemin / 5)
    let upperColLimit = Math.trunc(agemax / 5)

    let polygonData = await this.getFeatures({ lowerColLimit, upperColLimit, gender, transparence })


    const startTime = performance.now()
    let vectorSource: VectorSource = new VectorSource()
    await this.buildFeaturesInChunks(polygonData, vectorSource)
    const endTime = performance.now()
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)



    if (this.vectorLayer)
      this.map.removeLayer(this.vectorLayer)
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        let color = feature.get("color");

        let s = new Style({
          fill: new Fill({
            color: color,
          }),
        })
        return s;
      },
    });


    this.map.addLayer(this.vectorLayer)
  }
}