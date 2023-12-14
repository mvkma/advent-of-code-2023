import * as process from "node:process";

import { main01 } from "./01";
import { main02 } from "./02";
import { main03 } from "./03";
import { main04 } from "./04";
import { main05 } from "./05";
import { main06 } from "./06";
import { main07 } from "./07";
import { main08 } from "./08";

const problemEntryPoints: Map<String, Function> = new Map();

problemEntryPoints.set("01", main01);
problemEntryPoints.set("02", main02);
problemEntryPoints.set("03", main03);
problemEntryPoints.set("04", main04);
problemEntryPoints.set("05", main05);
problemEntryPoints.set("06", main06);
problemEntryPoints.set("07", main07);
problemEntryPoints.set("08", main08);

function main() {
    if (process.argv.length < 3) {
        console.log("usage: node main.js <problem>");
        process.exit(1);
    }

    const id: String = process.argv[2];

    if (problemEntryPoints.has(id)) {
        const subMain = problemEntryPoints.get(id)!;
        subMain();
    } else {
        console.log("Problem does not exist: " + id)
        process.exit(1);
    }
};

main();