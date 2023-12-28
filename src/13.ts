import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`

function transpose(pattern: string[]): string[] {
    let transposed = [];
    let line = "";

    for (let i = 0; i < pattern[0].length; i++) {
        line = "";
        for (let j = 0; j < pattern.length; j++) {
            line += pattern[j][i];
        }
        transposed.push(line);
    }

    return transposed;
}

function findHorizontalReflection(pattern: string[]): number {
    for (let i = 0; i < pattern.length; i++) {
        let j = 1;
        while (pattern[i + j - 1] === pattern[i - j]) {
            if (i - j === 0 || i + j - 1 === pattern.length - 1) {
                return i;
            }
            j++;
        }
    }
    return -1;
}

function reflectionScore(pattern: string[]): number {
    if (pattern.length === 0) {
        return 0;
    }

    let r = findHorizontalReflection(pattern);
    if (r !== -1) {
        return 100 * r;
    }

    r = findHorizontalReflection(transpose(pattern));
    if (r !== -1) {
        return r;
    }

    return 0;
}

export async function main13() {
    let file = await fs.open("input/13.txt");

    let pattern = [];
    let total = 0;

    // for (const line of EXAMPLE_01.split("\n")) {
    for await (const line of file.readLines()) {
        if (line === "") {
            total += reflectionScore(pattern);
            pattern = [];
            continue;
        }

        pattern.push(line);
    }

    total += reflectionScore(pattern);
    console.log(total);
}