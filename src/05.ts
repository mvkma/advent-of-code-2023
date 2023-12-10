import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`;

type RangeMap = {
    sourceStart: number;
    targetStart: number;
    length: number;
}

type Resource = {
    type: string;
    value: number;
}

type MapOutput = {
    target: string;
    fun: Function;
}

function makeMap(ranges: RangeMap[]): Function {
    const f = (x: number) => {
        for (const range of ranges) {
            if (range.sourceStart <= x && x < range.sourceStart + range.length) {
                return x - range.sourceStart + range.targetStart;
            }
        }
        return x;
    }

    return f;
}

function applyMaps(maps: Map<string, MapOutput>, input: Resource, targetType: string) {
    while (input.type !== targetType) {
        let m = maps.get(input.type)!;
        input.type = m.target;
        input.value = m.fun(input.value);
    }

    return input;
}

export async function main05() {
    let file = await fs.open("input/05.txt");

    let initialSeeds: number[] = [];
    let maps: Map<string, MapOutput> = new Map();

    let isHeader: boolean = false;
    let source: string = "";
    let target: string = "";
    let ranges: RangeMap[] = [];

    for await (const line of file.readLines()) {
    // for (const line of EXAMPLE_01.split("\n")) {
        if (line.startsWith("seeds:")) {
            initialSeeds = line.substring(6).trim().split(" ").map(Number);
            continue;
        }

        if (line === "") {
            if (source.length > 0 && target.length > 0) {
                maps.set(source, { target: target, fun: makeMap(ranges) });
            }
            ranges = [];
            isHeader = true;
            continue;
        }

        if (isHeader) {
            [source, target] = line.split(" ")[0].split("-to-");
            isHeader = false;
            continue;
        }

        let parts = line.trim().split(" ").map(c => Number(c.trim()));
        ranges.push({
            sourceStart: parts[1],
            targetStart: parts[0],
            length: parts[2],
        })
    }

    maps.set(source, { target: target, fun: makeMap(ranges), });

    const out = initialSeeds.map(n => applyMaps(maps, { type: "seed", value: n }, "location").value);
    console.log(Math.min(...out));
}