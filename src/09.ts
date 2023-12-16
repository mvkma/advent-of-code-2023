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

function predict(sequence: number[]): number {
    const ends: number[] = [sequence[sequence.length - 1]];

    let diffs = differences(sequence);
    ends.push(diffs.at(-1)!)

    while (!diffs.map(s => s === 0).reduce((a, b) => a && b)) {
        diffs = differences(diffs);
        ends.push(diffs.at(-1)!)
    }

    return ends.reduce((a, b) => a + b);
}

export async function main09() {
    const file = await fs.open("input/09.txt");

    let total = 0;

    for await (const line of file.readLines()) {
    // for (const line of EXAMPLE_01.split("\n")) {
        if (line === "") {
            continue;
        }

        const sequence = line.split(" ").map(Number);

        total += predict(sequence);
    }

    console.log(total);
}