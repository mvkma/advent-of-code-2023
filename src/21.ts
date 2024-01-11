import * as fs from "node:fs/promises";
import { ObjectMap, ObjectSet, heap } from "./utils";

const EXAMPLE_01 = `
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`;

type Grid = {
    rows: number;
    cols: number;
    repeat: boolean;
}

type Position = {
    i: number;
    j: number;
}

type State = {
    position: Position;
    steps: number;
}

function getNeighbors(state: State, grid: Grid, rocks: ObjectSet<Position>): State[] {
    let position: Position = state.position;

    let neighbors: Position[] = [
        { i: position.i + 1, j: position.j },
        { i: position.i - 1, j: position.j },
        { i: position.i, j: position.j + 1 },
        { i: position.i, j: position.j - 1 },
    ];

    return neighbors.filter(
        pos => {
            if (grid.repeat) {
                return !rocks.has({
                    i: pos.i < 0 ? grid.rows + (pos.i % grid.rows) : pos.i % grid.rows,
                    j: pos.j < 0 ? grid.cols + (pos.j % grid.cols) : pos.j % grid.cols
                });
            }

            return pos.i >= 0 && pos.i < grid.rows && pos.j >= 0 && pos.j < grid.cols && !rocks.has(pos);
        }
    ).map(
        pos => { return { position: pos, steps: state.steps + 1 } as State }
    );
}

function countFinalPositions(start: State, rocks: ObjectSet<Position>, nsteps: number, grid: Grid): number {
    let seen = new ObjectSet<Position>();
    let total = 0;
    let queue = heap<State>();

    queue.insert(0, start);

    while (queue.size() > 0) {
        let [steps, state] = queue.pop()! as [number, State];

        if (seen.has(state.position)) {
            continue;
        }
        seen.add(state.position);

        if ((steps % 2 === nsteps % 2)) {
            total++;
        }

        if (steps >= nsteps) {
            continue;
        }

        for (const next of getNeighbors(state, grid, rocks)) {
            queue.insert(steps + 1, next);
        }
    }

    return total;
}

export async function main21() {
    const file = await fs.open("input/21.txt");
    const lines = (await file.readFile()).toString().split("\n").slice(0, -1);
    // const lines = EXAMPLE_01.split("\n").slice(1);
    const nsteps = 64;
    const grid: Grid = { rows: lines.length, cols: lines[0].length, repeat: false };

    let rocks = new ObjectSet<Position>();
    let start: State = { position: { i: 0, j: 0 }, steps: 0 };

    for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.cols; j++) {
            switch (lines[i][j]) {
                case ".":
                    break;
                case "S":
                    start.position = { i: i, j: j };
                    break;
                case "#":
                    rocks.add({ i: i, j: j });
                    break;
                default:
                    throw Error("Unknown symbol at pos " + i + ", " + j + ": " + lines[i][j]);
            }

        }
    }

    console.log(countFinalPositions(start, rocks, nsteps, grid));

    grid.repeat = true;
    let coeffs: number[] = [];

    for (let i = 0; i < 3; i++) {
        let steps = i * grid.cols + Math.floor(grid.cols / 2);
        coeffs.push(countFinalPositions(start, rocks, steps, grid));
    }

    let [a, b, c] = coeffs;
    let n = Math.floor(26501365 / grid.cols);
    console.log((a - 2 * b + c) * n**2 / 2 - (3 * a - 4 * b + c) * n / 2 + a);
}
