import * as fs from "node:fs/promises";
import { ObjectMap, ObjectSet, heap } from "./utils";

const EXAMPLE_01 = `
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`;

type Grid = {
    rows: number;
    cols: number;
}

const Directions = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
} as const;

type Direction = typeof Directions[keyof typeof Directions];

type State = {
    i: number;
    j: number;
    s: number;
    d: Direction;
    prev: State | undefined;
}

function getNeighbors(curr: State, turnCondition: (s: State) => boolean, continueCondition: (s: State) => boolean) {
    let neighbors: State[] = [];

    switch (curr.d) {
        case Directions.Down:
            if (continueCondition(curr)) {
                neighbors.push(
                    { i: curr.i, j: curr.j - 1, d: Directions.Left, s: 1, prev: undefined },
                    { i: curr.i, j: curr.j + 1, d: Directions.Right, s: 1, prev: undefined },
                );
            }
            if (turnCondition(curr)) {
                neighbors.push(
                    { i: curr.i + 1, j: curr.j, d: Directions.Down, s: curr.s + 1, prev: undefined }
                );
            }
            break;

        case Directions.Up:
            if (continueCondition(curr)) {
                neighbors.push(
                    { i: curr.i, j: curr.j - 1, d: Directions.Left, s: 1, prev: undefined },
                    { i: curr.i, j: curr.j + 1, d: Directions.Right, s: 1, prev: undefined },
                );
            }
            if (turnCondition(curr)) {
                neighbors.push(
                    { i: curr.i - 1, j: curr.j, d: Directions.Up, s: curr.s + 1, prev: undefined }
                );
            }
            break;

        case Directions.Right:
            if (continueCondition(curr)) {
                neighbors.push(
                    { i: curr.i - 1, j: curr.j, d: Directions.Up, s: 1, prev: undefined },
                    { i: curr.i + 1, j: curr.j, d: Directions.Down, s: 1, prev: undefined },
                );
            }
            if (turnCondition(curr)) {
                neighbors.push(
                    { i: curr.i, j: curr.j + 1, d: Directions.Right, s: curr.s + 1, prev: undefined }
                );
            }
            break;

        case Directions.Left:
            if (continueCondition(curr)) {
                neighbors.push(
                    { i: curr.i - 1, j: curr.j, d: Directions.Up, s: 1, prev: undefined },
                    { i: curr.i + 1, j: curr.j, d: Directions.Down, s: 1, prev: undefined },
                );
            }
            if (turnCondition(curr)) {
                neighbors.push(
                    { i: curr.i, j: curr.j - 1, d: Directions.Left, s: curr.s + 1, prev: undefined }
                );
            }
            break;
    }

    return neighbors;
}

export async function main17() {
    const file = await fs.open("input/17.txt");
    const lines = (await file.readFile()).toString().trim().split("\n").map(s => Array.from(s).map(Number));
    // const lines = EXAMPLE_01.split("\n").slice(1).map(s => Array.from(s).map(Number));
    const grid: Grid = { rows: lines.length, cols: lines[0].length };

    let queue = heap<State>();
    let seen = new ObjectMap<State>();

    queue.insert(0, { i: 0, j: 0, s: 0, d: Directions.Down, prev: undefined })
    queue.insert(0, { i: 0, j: 0, s: 0, d: Directions.Right, prev: undefined })

    while (queue.size() > 0) {
        let [prio, curr] = queue.pop()! as [number, State];

        if ((curr.i === grid.rows - 1) && (curr.j === grid.cols - 1)) {
            console.log(prio);
            break;
        }

        // console.log();
        for (const next of getNeighbors(curr, (s: State) => s.s < 3, (_: State) => true)) {
            if (next.i < 0 || next.i >= grid.rows || next.j < 0 || next.j >= grid.cols) {
                continue;
            }

            let newPrio = prio + lines[next.i][next.j];
            if (seen.has(next) && seen.get(next) <= newPrio) {
                continue;
            }

            queue.insert(newPrio, next);
            seen.set(next, newPrio);
        }
    }

    queue = heap<State>();
    seen = new ObjectMap<State>();

    queue.insert(0, { i: 0, j: 0, s: 0, d: Directions.Down, prev: undefined })
    queue.insert(0, { i: 0, j: 0, s: 0, d: Directions.Right, prev: undefined })

    while (queue.size() > 0) {
        let [prio, curr] = queue.pop()! as [number, State];

        if ((curr.i === grid.rows - 1) && (curr.j === grid.cols - 1)) {
            console.log(prio);
            break;
        }

        // console.log();
        for (const next of getNeighbors(curr, (s: State) => s.s < 10, (s: State) => s.s >= 4)) {
            if (next.i < 0 || next.i >= grid.rows || next.j < 0 || next.j >= grid.cols) {
                continue;
            }

            let newPrio = prio + lines[next.i][next.j];
            if (seen.has(next) && seen.get(next) <= newPrio) {
                continue;
            }

            queue.insert(newPrio, next);
            seen.set(next, newPrio);
        }
    }


}