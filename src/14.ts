import * as fs from "node:fs/promises";
import { brent } from "./utils";

const EXAMPLE_01 = `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`

type Tuple = [number, number];

const projRow = ([i, _]: Tuple) => i;

const projCol = ([_, j]: Tuple) => j;

function tiltNorth(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple) {
    let newRoundRocks: Tuple[] = [];

    for (let col = 0; col < grid[1]; col++) {
        let rocks = roundRocks.filter(r => projCol(r) === col).toSorted((r, s) => projRow(r) - projRow(s));
        let blockers = [-1].concat(cubeRocks.filter(r => projCol(r) === col).map(projRow));
        blockers.push(grid[0]);
        blockers = blockers.toSorted((a, b) => a - b);

        for (const [r, c] of rocks) {
            for (let k = 0; k < blockers.length - 1; k++) {
                if (blockers[k] <= r && r < blockers[k + 1]) {
                    newRoundRocks.push([blockers[k] + 1, c]);
                    blockers[k]++;
                    break;
                }
            }
        }
    }

    return newRoundRocks;
}

function tiltSouth(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple) {
    let newRoundRocks: Tuple[] = [];

    for (let col = 0; col < grid[1]; col++) {
        let rocks = roundRocks.filter(r => projCol(r) === col).toSorted((r, s) => projRow(s) - projRow(r));
        let blockers = [-1].concat(cubeRocks.filter(r => projCol(r) === col).map(projRow));
        blockers.push(grid[0]);
        blockers = blockers.toSorted((a, b) => a - b);

        for (const [r, c] of rocks) {
            for (let k = 0; k < blockers.length - 1; k++) {
                if (blockers[k] <= r && r < blockers[k + 1]) {
                    newRoundRocks.push([blockers[k + 1] - 1, c]);
                    blockers[k + 1]--;
                    break;
                }
            }
        }
    }

    return newRoundRocks;
}

function tiltWest(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple) {
    let newRoundRocks: Tuple[] = [];

    for (let row = 0; row < grid[1]; row++) {
        let rocks = roundRocks.filter(r => projRow(r) === row).toSorted((r, s) => projCol(r) - projCol(s));
        let blockers = [-1].concat(cubeRocks.filter(r => projRow(r) === row).map(projCol));
        blockers.push(grid[1]);
        blockers = blockers.toSorted((a, b) => a - b);

        for (const [r, c] of rocks) {
            for (let k = 0; k < blockers.length - 1; k++) {
                if (blockers[k] <= c && c < blockers[k + 1]) {
                    newRoundRocks.push([r, blockers[k] + 1]);
                    blockers[k]++;
                    break;
                }
            }
        }
    }

    return newRoundRocks;
}

function tiltEast(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple) {
    let newRoundRocks: Tuple[] = [];

    for (let row = 0; row < grid[1]; row++) {
        let rocks = roundRocks.filter(r => projRow(r) === row).toSorted((r, s) => projCol(s) - projCol(r));
        let blockers = [-1].concat(cubeRocks.filter(r => projRow(r) === row).map(projCol));
        blockers.push(grid[1]);
        blockers = blockers.toSorted((a, b) => a - b);

        for (const [r, c] of rocks) {
            for (let k = 0; k < blockers.length - 1; k++) {
                if (blockers[k] <= c && c < blockers[k + 1]) {
                    newRoundRocks.push([r, blockers[k + 1] - 1]);
                    blockers[k + 1]--;
                    break;
                }
            }
        }
    }

    return newRoundRocks;
}

function totalLoadNorth(rocks: Tuple[], grid: Tuple): number {
    let total = 0;
    for (let i = grid[0]; i > 0; i--) {
        let n = rocks.filter(([r, _]) => r === grid[0] - i).map(projRow).length;
        total += i * n;
    }

    return total;
}

function printRocks(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple): void {
    let lines = [];

    for (let i = 0; i < grid[0]; i++) {
        let line = (new Array(grid[1])).fill(".")
        for (const [r, c] of roundRocks) {
            if (r !== i) {
                continue;
            }

            line[c] = "O";
        }

        for (const [r, c] of cubeRocks) {
            if (r !== i) {
                continue;
            }

            line[c] = "#";
        }
        lines.push(line.reduce((s, b) => s + b, ""));
    }

    console.log(lines.reduce((s, b) => s + b + "\n", ""));
}

function cycle(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple) {
    let tiltedRocks = tiltNorth(roundRocks, cubeRocks, grid);

    tiltedRocks = tiltWest(tiltedRocks, cubeRocks, grid);

    tiltedRocks = tiltSouth(tiltedRocks, cubeRocks, grid);

    tiltedRocks = tiltEast(tiltedRocks, cubeRocks, grid);

    return tiltedRocks;
}

export async function main14() {
    // let lines = EXAMPLE_01.split("\n").filter(s => s !== "");

    const file = await fs.open("input/14.txt");
    const lines = (await file.readFile()).toString().split("\n").filter(s => s != "");

    let cubeRocks = [];
    let roundRocks = [];

    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[0].length; j++) {
            switch (lines[i][j]) {
                case "O":
                    roundRocks.push([i, j] as Tuple);
                    break;
                case "#":
                    cubeRocks.push([i, j] as Tuple);
                    break;
            }
        }
    }

    const grid: Tuple = [lines.length, lines[0].length];

    // printRocks(roundRocks, cubeRocks, grid);

    let tiltedRocks = tiltNorth(roundRocks, cubeRocks, grid);
    let score = totalLoadNorth(tiltedRocks, grid);
    console.log(score);

    tiltedRocks = cycle(roundRocks, cubeRocks, grid);
    // printRocks(tiltedRocks, cubeRocks, grid);

    let scores = [totalLoadNorth(tiltedRocks, grid)];

    for (let i = 0; i < 1000; i++) {
        tiltedRocks = cycle(tiltedRocks, cubeRocks, grid);
        score = totalLoadNorth(tiltedRocks, grid);
        scores.push(score);
    }

    let maxOffset = 0;
    let maxPeriod = 0;
    for (let i = 0; i < 900; i++) {
        let [offset, period] = brent(scores.slice(i));
        if (period > maxPeriod) {
            maxPeriod = period;
            maxOffset = i + offset;
        }
    }

    let rem = (1000000000 - maxOffset) % maxPeriod;
    console.log(scores[rem + maxOffset - 1]);

}