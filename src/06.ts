import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
Time:      7  15   30
Distance:  9  40  200`

function extractNumbers(line: string) {
    let numbers: number[] = [];

    for (const match of line.matchAll(/\d+/g)) {
        numbers.push(Number(match[0]));
    }

    return numbers;
}

export async function main06() {
    const file = await fs.open("input/06.txt");
    const lines = (await file.readFile()).toString().split("\n");
    // const lines = EXAMPLE_01.split("\n").splice(1);

    const [times, distances] = lines.map(extractNumbers);

    let result = 1;
    for (let i = 0; i < times.length; i++) {
        let t = times[i];
        let d = distances[i];

        let x = 0;
        while (true) {
            if (x * (t - x) > d) {
                break;
            }
            x += 1;
        }
        result *= t - 2 * x + 1;
    }

    console.log(result);
}