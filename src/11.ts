import * as fs from "node:fs/promises"
import { heap, type Heap } from "./utils";

const EXAMPLE_01 = `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`

const EXAMPLE_02 = `
....#........
.........#...
#............
.............
.............
........#....
.#...........
............#
.............
.............
.........#...
#....#.......`

type Grid = {
    imax: number;
    jmax: number;
}

function getNeighbors(id: number, grid: Grid): number[] {
    let neighbors: number[] = [];

    if (id % grid.jmax !== 0) {
        neighbors.push(id - 1);
    }

    if (id % grid.jmax !== grid.jmax - 1) {
        neighbors.push(id + 1);
    }

    if (id >= grid.jmax) {
        neighbors.push(id - grid.jmax);
    }

    if (Math.floor(id / grid.jmax) < grid.jmax - 1) {
        neighbors.push(id + grid.jmax);
    }

    return neighbors;
}

function expandGrid(
    galaxies: number[],
    grid: Grid,
    markedRows: Set<number>,
    markedColumns: Set<number>): [number[], Grid] {
    const rows: number[] = [];
    for (let i = 0; i < grid.imax; i++) {
        if (!markedRows.has(i)) {
            rows.push(i);
        }
    }

    const columns: number[] = [];
    for (let j = 0; j < grid.jmax; j++) {
        if (!markedColumns.has(j)) {
            columns.push(j);
        }
    }

    const newGalaxies = galaxies.slice();
    const newGrid = { imax: grid.imax, jmax: grid.jmax };
    for (let m = 0; m < rows.length; m++) {
        for (let k = 0; k < newGalaxies.length; k++) {
            if (newGalaxies[k] > rows[m] * newGrid.jmax) {
                newGalaxies[k] += newGrid.jmax;
            }
        }
        newGrid.imax++;
        for (let n = m + 1; n < rows.length; n++) {
            rows[n]++;
        }
    }

    for (let n = 0; n < columns.length; n++) {
        for (let k = 0; k < newGalaxies.length; k++) {
            if (newGalaxies[k] % newGrid.jmax > columns[n]) {
                newGalaxies[k] += Math.floor(newGalaxies[k] / newGrid.jmax) + 1;
            } else {
                newGalaxies[k] += Math.floor(newGalaxies[k] / newGrid.jmax);
            }
        }
        newGrid.jmax++;
        for (let m = n + 1; m < columns.length; m++) {
            columns[m]++;
        }
    }

    return [newGalaxies, newGrid];
}

function shortestPath(start: number, galaxies: number[], grid: Grid, endCondition: Function) {
    let distances = new Map<number, number>();
    distances.set(start, 0);

    let queue = heap<number>();
    queue.insert(0, start);

    while (queue.size() > 0) {
        let curr = queue.pop()!;

        if (endCondition(distances)) {
            break;
        }

        for (const next of getNeighbors(curr, grid)) {
            let alt = distances.get(curr)! + 1;

            if (distances.has(next) && distances.get(next)! <= alt) {
                continue;
            }

            distances.set(next, alt);
            queue.insert(alt, next);
        }
    }

    return distances;
}

export async function main11() {
    // const lines = EXAMPLE_01.split("\n").slice(1);
    const file = await fs.open("input/11.txt");
    const lines = (await file.readFile()).toString().split("\n");

    const grid: Grid = { imax: lines.length, jmax: lines[0].length };
    const tupleToId = (i: number, j: number) => i * grid.jmax + j;
    const galaxies: number[] = [];

    const markedRows = new Set<number>();
    const markedColumns = new Set<number>();

    for (let i = 0; i < grid.imax; i++) {
        for (let j = 0; j< grid.jmax; j++) {
            if (lines[i][j] === "#") {
                galaxies.push(tupleToId(i, j));
                markedRows.add(i);
                markedColumns.add(j);
            }
        }
    }

    const [newGalaxies, newGrid] = expandGrid(galaxies, grid, markedRows, markedColumns);

    let distances = new Map<number, number>();

    for (let m = 0; m < newGalaxies.length; m++) {
        let dist = shortestPath(
            newGalaxies[m],
            newGalaxies,
            newGrid,
            (distances: Map<number, number>) => {
                for (let n = 0; n < newGalaxies.length; n++) {
                    if (!distances.has(newGalaxies[n])) {
                        return false;
                    }
                }
                return true;
            });

        for (let n = 0; n < newGalaxies.length; n++) {
            if (newGalaxies[n] < newGalaxies[m]) {
                distances.set(newGalaxies[n] * Math.max(...newGalaxies) + newGalaxies[m],
                    dist.get(newGalaxies[n])!);
            } else {
                distances.set(newGalaxies[m] * Math.max(...newGalaxies) + newGalaxies[n],
                    dist.get(newGalaxies[n])!);
            }
        }
    }

    let total = 0;
    for (const v of distances.values()) {
        total += v;
    }
    console.log(total);
}