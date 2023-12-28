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

const EXAMPLE_02 = `
#.#.#.###
.#....#..
..####..#
#.###..##
.#.##..##
.#....###
.#....###`

const EXAMPLE_03 = `
##.#....#
...##...#
...##..##
##.......
.....##..
..#..##..
..##....#
..#..##..
####....#`

const EXAMPLE_04 = `
#......####...##.
#.####.#.....#.##
#########.#..#..#
#..##..#...##..##
#..##..#...##..##
#########.#..#..#
#.####.#.....#.##
#......####...##.
#..##..#..#.##.#.
.##..##.##.##..##
..#..#..###.#####
#.####.#.###..#..
########.#####.##
##.##.##....####.
........###...#.#
#..##..#..#.#.###
###.####.####.###`

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

function findHorizontalReflection(pattern: string[], offset: number = 0): number {
    for (let i = offset + 1; i < pattern.length; i++) {
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

function reflectionScore(pattern: string[], originalScore: number = -1): number {
    if (pattern.length === 0) {
        return 0;
    }

    let r = findHorizontalReflection(pattern);
    if (100 * r === originalScore) {
        r = findHorizontalReflection(pattern, originalScore % 100 === 0 ? originalScore / 100 : originalScore);
    }

    if (r !== -1) {
        return 100 * r;
    }

    r = findHorizontalReflection(transpose(pattern));
    if (r === originalScore) {
        r = findHorizontalReflection(transpose(pattern), originalScore % 100 === 0 ? originalScore / 100 : originalScore);
    }

    if (r !== -1 && r !== originalScore) {
        return r;
    }

    return 0;
}

function fixSmudge(pattern: string[], originalScore: number) {
    let copy = pattern.slice();

    for (let i = 0; i < copy.length; i++) {
        if (i > 0) {
            copy[i - 1] = pattern[i - 1];
        }

        for (let j = 0; j < copy[0].length; j++) {
            let c = copy[i][j];

            switch (c) {
                case ".": {
                    copy[i] = copy[i].slice(0, j) + "#" + copy[i].slice(j + 1);
                    break;
                }
                case "#": {
                    copy[i] = copy[i].slice(0, j) + "." + copy[i].slice(j + 1);
                    break;
                }
            }

            let r = reflectionScore(copy, originalScore);
            if (r !== originalScore && r !== 0) {
                return r;
            }

            copy[i] = copy[i].slice(0, j) + c + copy[i].slice(j + 1);
        }
    }

    return originalScore;
}

export async function main13() {
    let file = await fs.open("input/13.txt");

    let pattern = [];
    let total = 0;
    let smearedTotal = 0;
    let score = 0;
    let smearedScore = 0;

    // for (const line of EXAMPLE_02.split("\n")) {
    for await (const line of file.readLines()) {
        if (line === "" && pattern.length > 0) {
            score = reflectionScore(pattern);
            total += score;
            smearedScore = fixSmudge(pattern, score);
            smearedTotal += smearedScore;
        }

        if (line === "") {
            pattern = [];
            continue;
        }

        pattern.push(line);
    }

    score = reflectionScore(pattern);
    total += score;
    smearedScore = fixSmudge(pattern, score);
    smearedTotal += smearedScore;
    console.log(total);
    console.log(smearedTotal);
}