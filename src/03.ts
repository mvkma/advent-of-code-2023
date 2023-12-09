import * as fs from "node:fs/promises"

const EXAMPLE_01 = `
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`

const NUMBER_REGEX = /\d+/g;
const SYMBOL_REGEX = /[^.\d]/g;
const GEAR = "*";

type NumberEntry = {
    value: number;
    start: number;
    end: number;
    processed: boolean;
};

type SymbolEntry = {
    char: string;
    index: number;
    processed: boolean;
    adjacentNumbers: number[];
};

export async function main03() {
    let sum = 0;
    let gearRatioSum = 0;

    let previousNumbers: NumberEntry[] = [];
    let currentNumbers: NumberEntry[] = [];

    let previousSymbols: SymbolEntry[] = [];
    let currentSymbols: SymbolEntry[] = [];

    let num: NumberEntry;
    let sym: SymbolEntry;

    const file = await fs.open("input/03.txt");

    for await (const line of file.readLines()) {
    // for (const line of EXAMPLE_01.split("\n")) {
        currentNumbers = [];
        currentSymbols = [];

        for (const m of line.matchAll(SYMBOL_REGEX)) {
            sym = {
                char: m[0],
                index: m.index!,
                processed: false,
                adjacentNumbers: [],
            };

            for (const prev of previousNumbers) {
                if (prev.start <= sym.index &&
                    sym.index <= prev.end! &&
                    !prev.processed
                ) {
                    sum += prev.value;
                    sym.processed = true;
                    sym.adjacentNumbers.push(prev.value);

                    if (sym.adjacentNumbers.length === 2 &&
                        sym.char === GEAR
                    ) {
                        gearRatioSum += sym.adjacentNumbers[0] * sym.adjacentNumbers[1];
                    }
                }
            }

            currentSymbols.push(sym);
        }

        for (const m of line.matchAll(NUMBER_REGEX)) {
            num = {
                value: Number(m[0]),
                start: m.index! - 1,
                end: m.index! + m[0].length,
                processed: false,
            };

            for (const symb of previousSymbols.concat(currentSymbols)) {
                if (num.processed) {
                    continue;
                }

                if ((num.start <= symb.index && symb.index <= num.end) ||
                    num.start === symb.index ||
                    num.end === symb.index
                ) {
                    sum += num.value;
                    num.processed = true;
                    symb.processed = true;
                    symb.adjacentNumbers.push(num.value);

                    if (symb.adjacentNumbers.length === 2 &&
                        symb.char === GEAR
                    ) {
                        gearRatioSum += symb.adjacentNumbers[0] * symb.adjacentNumbers[1];
                    }

                    break;
                }
            }

            currentNumbers.push(num);
        }

        previousNumbers = currentNumbers;
        previousSymbols = currentSymbols;
    }

    console.log(sum);
    console.log(gearRatioSum);
}