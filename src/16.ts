import * as fs from "node:fs/promises";
import { ObjectSet } from "./utils";

const EXAMPLE_01 = `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`;

const Directions = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
} as const;

type Direction = typeof Directions[keyof typeof Directions];

type LightRay = {
    direction: Direction;
    i: number;
    j: number;
}

type Grid = {
    rows: number;
    cols: number;
}

function move(ray: LightRay, grid: Grid): LightRay {
    switch (ray.direction) {
        case Directions.Left:
            return { direction: ray.direction, i: ray.i, j: ray.j - 1 };
        case Directions.Right:
            return { direction: ray.direction, i: ray.i, j: ray.j + 1 };
        case Directions.Up:
            return { direction: ray.direction, i: ray.i - 1, j: ray.j };
        case Directions.Down:
            return { direction: ray.direction, i: ray.i + 1, j: ray.j };
    }
}

export async function main16() {
    // const lines = EXAMPLE_01.split("\n").slice(1);
    const file = await fs.open("input/16.txt");
    const lines = (await file.readFile()).toString().trim().split("\n");
    const grid: Grid = { rows: lines.length, cols: lines[0].length };

    let queue: LightRay[] = [{ direction: Directions.Right, i: 0, j: -1 }];
    let seen = new ObjectSet<LightRay>();
    let visited = new ObjectSet<[number, number]>();

    while (queue.length > 0) {
        let curr = queue.pop()!;

        if (seen.has(curr)) {
            continue;
        }

        seen.add(curr);
        visited.add([curr.i, curr.j]);

        let next = move(curr, grid);

        if (next.i < 0 || next.i >= grid.rows || next.j < 0 || next.j >= grid.cols) {
            continue;
        }

        switch (lines[next.i][next.j]) {
            case ".":
                queue.push(next);
                break;

            case "|":
                switch (curr.direction) {
                    case Directions.Down:
                    case Directions.Up:
                        queue.push(next);
                        break;
                    case Directions.Right:
                    case Directions.Left:
                        queue.push(
                            { direction: Directions.Down, i: next.i, j: next.j },
                            { direction: Directions.Up, i: next.i, j: next.j },
                        );
                        break;
                }
                break;

            case "-":
                switch (curr.direction) {
                    case Directions.Down:
                    case Directions.Up:
                        queue.push(
                            { direction: Directions.Right, i: next.i, j: next.j },
                            { direction: Directions.Left, i: next.i, j: next.j },
                        );
                        break;
                    case Directions.Right:
                    case Directions.Left:
                        queue.push(next);
                        break;
                }
                break;

            case "/":
                switch (curr.direction) {
                    case Directions.Down:
                        queue.push({ direction: Directions.Left, i: next.i, j: next.j });
                        break;
                    case Directions.Left:
                        queue.push({ direction: Directions.Down, i: next.i, j: next.j });
                        break;
                    case Directions.Up:
                        queue.push({ direction: Directions.Right, i: next.i, j: next.j });
                        break;
                    case Directions.Right:
                        queue.push({ direction: Directions.Up, i: next.i, j: next.j });
                        break;
                }
                break;

            case "\\":
                switch (curr.direction) {
                    case Directions.Down:
                        queue.push({ direction: Directions.Right, i: next.i, j: next.j });
                        break;
                    case Directions.Right:
                        queue.push({ direction: Directions.Down, i: next.i, j: next.j });
                        break;
                    case Directions.Left:
                        queue.push({ direction: Directions.Up, i: next.i, j: next.j });
                        break;
                    case Directions.Up:
                        queue.push({ direction: Directions.Left, i: next.i, j: next.j });
                        break;
                }
                break;

        }
    }

    console.log(visited.size - 1);
}