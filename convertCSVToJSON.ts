import Papa from 'papaparse';
import * as fs from 'fs';
import proj4 from "proj4";
const LV95 = "EPSG:2056";
const WGS84 = "EPSG:4326";

proj4.defs(LV95,
    "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 " +
    "+k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel " +
    "+towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);

// Convert function
function lv95ToLatLng(e: number, n: number) {
    const [lng, lat] = proj4(LV95, WGS84, [e, n]);
    return { lat: lat, lng: lng };   // Leaflet wants [lat, lng]
}

function main() {
    console.log("Convert")
    const fileContent = fs.readFileSync('STATPOP2024MEN.csv', 'utf8');

    var parseResult = Papa.parse(fileContent, { delimiter: "," })
    console.log(parseResult.data.length)
    var row = parseResult.data.at(0);
    if (!Array.isArray(row)) return;
    var xCol = row.findIndex((e) => e === "E_KOORD")
    var yCol = row.findIndex((e) => e === "N_KOORD")
    var totCol = row.findIndex((e) => e === "BBTOT")
    var bm01 = row.findIndex((e) => e === "BBM01") // Males 0-4
    var bm02 = row.findIndex((e) => e === "BBM02") // Males 5-9
    var bm03 = row.findIndex((e) => e === "BBM03") // Males 10-14
    var bm04 = row.findIndex((e) => e === "BBM04") // Males 15-19
    var bm05 = row.findIndex((e) => e === "BBM05") // Males 20-24
    var bm06 = row.findIndex((e) => e === "BBM06") // Males 20-24
    var bm07 = row.findIndex((e) => e === "BBM07") // Males 20-24
    var bm08 = row.findIndex((e) => e === "BBM08")
    var bm09 = row.findIndex((e) => e === "BBM09")
    var bm10 = row.findIndex((e) => e === "BBM10")
    var bm11 = row.findIndex((e) => e === "BBM11")
    var bm12 = row.findIndex((e) => e === "BBM12")
    var bm13 = row.findIndex((e) => e === "BBM13")
    var bm14 = row.findIndex((e) => e === "BBM14")
    var bm15 = row.findIndex((e) => e === "BBM15")
    var bm16 = row.findIndex((e) => e === "BBM16")
    var bm17 = row.findIndex((e) => e === "BBM17")
    var bm18 = row.findIndex((e) => e === "BBM18")

    var bw01 = row.findIndex((e) => e === "BBW01") // Males 0-4
    var bw02 = row.findIndex((e) => e === "BBW02") // Males 5-9
    var bw03 = row.findIndex((e) => e === "BBW03") // Males 10-14
    var bw04 = row.findIndex((e) => e === "BBW04") // Males 15-19
    var bw05 = row.findIndex((e) => e === "BBW05") // Males 20-24
    var bw06 = row.findIndex((e) => e === "BBW06") // Males 20-24
    var bw07 = row.findIndex((e) => e === "BBW07") // Males 20-24
    var bw08 = row.findIndex((e) => e === "BBW08")
    var bw09 = row.findIndex((e) => e === "BBW09")
    var bw10 = row.findIndex((e) => e === "BBW10")
    var bw11 = row.findIndex((e) => e === "BBW11")
    var bw12 = row.findIndex((e) => e === "BBW12")
    var bw13 = row.findIndex((e) => e === "BBW13")
    var bw14 = row.findIndex((e) => e === "BBW14")
    var bw15 = row.findIndex((e) => e === "BBW15")
    var bw16 = row.findIndex((e) => e === "BBW16")
    var bw17 = row.findIndex((e) => e === "BBW17")
    var bw18 = row.findIndex((e) => e === "BBW18")
    var data = []
    for (let i = 1; i < parseResult.data.length; i++) {
        let row = parseResult.data[i];
        if (Array.isArray(row)) {
            let x = Number.parseInt(row[xCol], 10);
            let y = Number.parseInt(row[yCol], 10);
            if (isNaN(x) || isNaN(y)) {
                console.error("Nan: ", row[xCol], row[yCol])
                continue;
            }
            const coordinates = lv95ToLatLng(x, y)
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 0, max: 4, tot: row[bm01] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 5, max: 9, tot: row[bm02] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 10, max: 14, tot: row[bm03] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 15, max: 19, tot: row[bm04] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 20, max: 24, tot: row[bm05] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 25, max: 29, tot: row[bm06] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 30, max: 34, tot: row[bm07] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 35, max: 39, tot: row[bm08] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 40, max: 44, tot: row[bm09] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 45, max: 49, tot: row[bm10] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 50, max: 54, tot: row[bm11] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 55, max: 59, tot: row[bm12] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 60, max: 64, tot: row[bm13] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 65, max: 69, tot: row[bm14] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 70, max: 74, tot: row[bm15] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 75, max: 79, tot: row[bm16] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 80, max: 84, tot: row[bm17] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "m", min: 85, max: 89, tot: row[bm18] })

            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 0, max: 4, tot: row[bw01] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 5, max: 9, tot: row[bw02] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 10, max: 14, tot: row[bw03] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 15, max: 19, tot: row[bw04] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 20, max: 24, tot: row[bw05] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 25, max: 29, tot: row[bw06] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 30, max: 34, tot: row[bw07] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 35, max: 39, tot: row[bw08] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 40, max: 44, tot: row[bw09] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 45, max: 49, tot: row[bw10] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 50, max: 54, tot: row[bw11] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 55, max: 59, tot: row[bw12] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 60, max: 64, tot: row[bw13] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 65, max: 69, tot: row[bw14] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 70, max: 74, tot: row[bw15] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 75, max: 79, tot: row[bw16] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 80, max: 84, tot: row[bw17] })
            data.push({ lat: coordinates.lat, lng: coordinates.lng, gender: "f", min: 85, max: 89, tot: row[bw18] })
        }
    }
    fs.writeFileSync("./public/STATPOP2024.json", JSON.stringify(data))
}
main()