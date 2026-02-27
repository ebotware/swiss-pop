import type { PolygonData, WorkerRequest, WorkerResponse } from "./geodata-worker.types";
import type { CRD } from "./open-layers-layer-manager";
import type { StatPopRowType } from "./StatPopRowType";

export { };

async function loadStatPopJSONData(): Promise<StatPopRowType[]> {
    const response = await fetch("/swiss-pop/STATPOP2024.json");

    if (!response.ok) {
        throw new Error("Failed to load JSON");
    }

    const data: any = await response.json();
    var sanitizedData: StatPopRowType[] = []
    for (const rowData of data) {
        sanitizedData.push({ lat: Number(rowData.lat as string), lng: Number(rowData.lng as string), m: (rowData.m as string[]).map(Number), f: (rowData.f as string[]).map(Number) })
    }
    return sanitizedData;
}

let statPopData:StatPopRowType[] = [];
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    const { gender, lowerColLimit, upperColLimit, transparence } = event.data.payload;
    if (statPopData.length==0) {
        console.log("Loading statpop data for the first time")
        statPopData = await loadStatPopJSONData()
    }
    let total = 0;
    let cumulativeValue = new Map<string, CRD>()
    let max = 0;
    for (const statPopRow of statPopData) {
        if (gender == "m" || gender == "a")
            total = statPopRow.m.slice(lowerColLimit, upperColLimit).reduce((v, i) => v + i, 0)
        if (gender == "f" || gender == "a")
            total = statPopRow.f.slice(lowerColLimit, upperColLimit).reduce((v, i) => v + i, 0)
        if (total > max) max = total;
        cumulativeValue.set(statPopRow.lat + "-" + statPopRow.lng, { lat: statPopRow.lat, lng: statPopRow.lng, tot: total })
    }

    let poligonData: PolygonData[] = []
    for (const element of cumulativeValue) {
        var pNum = element[1].tot

        if (element[1].tot == 0) continue;

        let red = 0;
        let blue = 0;
        if (gender === "a") {
            red = pNum * 2
            blue = pNum * 2
        }
        if (gender === "f") {
            red = pNum * 4
        }
        if (gender === "m") {
            blue = pNum * 4
        }
        const halfSize = 50; // 100m square
        let centerX = element[1].lat;
        let centerY = element[1].lng;
        let poligonCoordinate = [
            [centerX - halfSize, centerY - halfSize],
            [centerX + halfSize, centerY - halfSize],
            [centerX + halfSize, centerY + halfSize],
            [centerX - halfSize, centerY + halfSize],
            [centerX - halfSize, centerY - halfSize],
        ]
        let data: PolygonData = { poligonCoordinate, pNum, color: `rgba(${red},10,${blue},${transparence})` }
        poligonData.push(data)
        //let feature = new Feature({ geometry: square, info: pNum });
        //feature.set("color", `rgba(${red},10,${blue},${transparence})`)

        //features.push(feature);
    }

    const response: WorkerResponse = {
        type: "result",
        result: poligonData
    };
    self.postMessage(response);
};