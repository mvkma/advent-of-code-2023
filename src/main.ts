import * as process from "node:process";

import { main01 } from "./01";
import { main02 } from "./02";

const problemEntryPoints: Map<String, Function> = new Map();

problemEntryPoints.set("01", main01);
problemEntryPoints.set("02", main02);

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