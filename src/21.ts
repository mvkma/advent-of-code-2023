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
        pos => pos.i >= 0 && pos.i < grid.rows && pos.j >= 0 && pos.j < grid.cols && !rocks.has(pos)
    ).map(
        pos => { return { position: pos, steps: state.steps + 1 } as State}
    );
}

export async function main21() {
    const file = await fs.open("input/21.txt");
    const lines = (await file.readFile()).toString().split("\n").slice(0, -1);
    // const lines = EXAMPLE_01.split("\n").slice(1);
    const nsteps = 64;
    const grid: Grid = { rows: lines.length, cols: lines[0].length };

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

    let seen = new ObjectMap<Position, number>();
    let final = new ObjectSet<Position>();
    let queue = heap<State>();

    seen.set(start.position, 0)
    queue.insert(nsteps, start);

    while (queue.size() > 0) {
        let [rem, state] = queue.pop()! as [number, State];
        let steps = nsteps - rem

        if ((steps % 2 === 0) && (steps <= nsteps)) {
            final.add(state.position);
        }

        if (steps === nsteps) {
            continue;
        }

        for (const next of getNeighbors(state, grid, rocks)) {
            if (!seen.has(next.position) || seen.get(next.position)! > steps + 1) {
                queue.insert(rem - 1, next);
            }

            seen.set(next.position, steps + 1);
        }
    }

    console.log(final.size);
}
