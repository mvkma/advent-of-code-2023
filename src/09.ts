import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`

function differences(sequence: number[]): number[] {
    const diffs: number[] = [];

    for (let i = 0; i < sequence.length - 1; i++) {
        diffs.push(sequence[i + 1] - sequence[i])
    }

    return diffs;
}

function predict(sequence: number[]): number[] {
    const starts: number[] = [sequence[0]];
    const ends: number[] = [sequence[sequence.length - 1]];

    let diffs = differences(sequence);
    starts.push(diffs.at(0)!);
    ends.push(diffs.at(-1)!);

    while (!diffs.map(s => s === 0).reduce((a, b) => a && b)) {
        diffs = differences(diffs);
        starts.push(diffs.at(0)!);
        ends.push(diffs.at(-1)!);
    }

    return [ends.reduce((a, b) => a + b), starts.reduceRight((a, b) => b - a)];
}

export async function main09() {
    const file = await fs.open("input/09.txt");

    let totalStarts = 0;
    let totalEnds = 0;

    for await (const line of file.readLines()) {
    // for (const line of EXAMPLE_01.split("\n")) {
        if (line === "") {
            continue;
        }

        const sequence = line.split(" ").map(Number);

        let prediction = predict(sequence);
        totalEnds += prediction[0];
        totalStarts += prediction[1];
    }

    console.log(totalEnds);
    console.log(totalStarts);
}