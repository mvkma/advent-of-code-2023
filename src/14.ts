import * as fs from "node:fs/promises";

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

function tiltNorth(roundRocks: Tuple[], cubeRocks: Tuple[], grid: Tuple) {
    let newRoundRocks: Tuple[] = [];

    for (let col = 0; col < grid[1]; col++) {
        let rocks = roundRocks.filter(([_, j]) => j === col);
        let blockers = [-1].concat(cubeRocks.filter(([_, j]) => j === col).map(([i, _]) => i));
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

function totalLoadNorth(rocks: Tuple[], grid: Tuple): number {
    let total = 0;
    for (let i = grid[0]; i > 0; i--) {
        let n = rocks.filter(([r, _]) => r === grid[0] - i).map(([r, c]) => r).length;
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

    const tiltedRocks = tiltNorth(roundRocks, cubeRocks, grid);
    const score = totalLoadNorth(tiltedRocks, grid);
    console.log(score);

    // printRocks(tiltedRocks, cubeRocks, grid);

}