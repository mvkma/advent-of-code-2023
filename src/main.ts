import * as process from "node:process";

import { main01 } from "./01";
import { main02 } from "./02";
import { main03 } from "./03";
import { main04 } from "./04";
import { main05 } from "./05";
import { main06 } from "./06";
import { main07 } from "./07";
import { main08 } from "./08";
import { main09 } from "./09";
import { main10 } from "./10";
import { main11 } from "./11";
import { main12 } from "./12";
import { main13 } from "./13";
import { main14 } from "./14";
import { main15 } from "./15";
import { main16 } from "./16";
import { main17 } from "./17";
import { main18 } from "./18";
import { main19 } from "./19";
import { main20 } from "./20";
import { main21 } from "./21";
import { main22 } from "./22";
import { main23 } from "./23";
import { main24 } from "./24";
import { main25 } from "./25";

const problemEntryPoints: Map<String, Function> = new Map();

problemEntryPoints.set("01", main01);
problemEntryPoints.set("02", main02);
problemEntryPoints.set("03", main03);
problemEntryPoints.set("04", main04);
problemEntryPoints.set("05", main05);
problemEntryPoints.set("06", main06);
problemEntryPoints.set("07", main07);
problemEntryPoints.set("08", main08);
problemEntryPoints.set("09", main09);
problemEntryPoints.set("10", main10);
problemEntryPoints.set("11", main11);
problemEntryPoints.set("12", main12);
problemEntryPoints.set("13", main13);
problemEntryPoints.set("14", main14);
problemEntryPoints.set("15", main15);
problemEntryPoints.set("16", main16);
problemEntryPoints.set("17", main17);
problemEntryPoints.set("18", main18);
problemEntryPoints.set("19", main19);
problemEntryPoints.set("20", main20);
problemEntryPoints.set("21", main21);
problemEntryPoints.set("22", main22);
problemEntryPoints.set("23", main23);
problemEntryPoints.set("24", main24);
problemEntryPoints.set("25", main25);

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