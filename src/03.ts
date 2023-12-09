import * as fs from "node:fs/promises"

const EXAMPLE_01 = `
467..114..
...*......
..35..633.
*.....#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`

const NUMBER_REGEX = /\d+/g;
const SYMBOL_REGEX = /[^.\d]/g;

type NumberEntry = {
    value: number;
    start: number;
    end: number;
};

export async function main03() {
    let sum = 0;

    let previousNumbers: NumberEntry[] = [];
    let currentNumbers: NumberEntry[] = [];

    let previousSymbols: number[] = [];
    let currentSymbols: number[] = [];

    let processed: boolean = false;
    let num: NumberEntry;

    const file = await fs.open("input/03.txt");

    for await (const line of file.readLines()) {
        // for (const line of EXAMPLE_01.split("\n")) {
        currentNumbers = [];
        currentSymbols = [];

        for (const m of line.matchAll(SYMBOL_REGEX)) {
            currentSymbols.push(m.index!);

            for (const prev of previousNumbers) {
                if (prev.start <= m.index! && m.index! <= prev.end!) {
                    sum += prev.value;
                }
            }
        }

        for (const m of line.matchAll(NUMBER_REGEX)) {
            processed = false;
            num = {
                value: Number(m[0]),
                start: m.index! - 1,
                end: m.index! + m[0].length,
            };

            for (const symb of previousSymbols.concat(currentSymbols)) {
                if (
                    (num.start <= symb && symb <= num.end) ||
                    num.start === symb ||
                    num.end === symb
                ) {
                    sum += num.value;
                    processed = true;
                    break;
                }
            }

            if (!processed) {
                currentNumbers.push(num);
            }
        }

        previousNumbers = currentNumbers;
        previousSymbols = currentSymbols;
    }

    console.log(sum);
}