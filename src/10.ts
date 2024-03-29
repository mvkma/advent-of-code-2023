import * as fs from "node:fs/promises"

const EXAMPLE_01 = `
.....
.S-7.
.|.|.
.L-J.
.....`

const EXAMPLE_02 = `
-L|F7
7S-7|
L|7||
-L-J|
L|-JF`

const EXAMPLE_03 = `
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ`

const EXAMPLE_04 = `
...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........`

const EXAMPLE_05 = `
..........
.S------7.
.|F----7|.
.||OOOO||.
.||OOOO||.
.|L-7F-J|.
.|II||II|.
.L--JL--J.
..........`

const EXAMPLE_06 = `
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`

type Position = {
    i: number;
    j: number;
}

function getAdjacent(pos: Position, imax: number, jmax: number) {
    let adjacent: Position[] = [
        { i: pos.i - 1, j: pos.j },
        { i: pos.i + 1, j: pos.j },
        { i: pos.i, j: pos.j - 1 },
        { i: pos.i, j: pos.j + 1 },
    ];

    return adjacent.filter(({i, j}) => i >= 0 && i < imax && j >= 0 && j < jmax);
}

function getNext(curr: Position, next: Position, symbol: string): Position {
    const moveSouth = next.i > curr.i;
    const moveNorth = next.i < curr.i;
    const moveEast = next.j > curr.j;

    switch (symbol) {
        case "|":
           return moveSouth ? { i: next.i + 1, j: next.j } : { i: next.i - 1, j: next.j };
        case "-":
           return moveEast ? { i: next.i, j: next.j + 1 } : { i: next.i, j: next.j - 1 };
        case "L":
            return moveSouth ? { i: next.i, j: next.j + 1 } : { i: next.i - 1, j: next.j };
        case "J":
            return moveSouth ? { i: next.i, j: next.j - 1 } : { i: next.i - 1, j: next.j };
        case "7":
            return moveEast ? { i: next.i + 1, j: next.j } : { i: next.i, j: next.j - 1 };
        case "F":
            return moveNorth ? { i: next.i, j: next.j + 1 } : { i: next.i + 1, j: next.j };
        case "S":
            return next;
        default:
            throw new Error("Unknown symbol: " + symbol);
    }
}

function countInteriorTiles(loop: Position[], lines: string[], imax: number, jmax: number) {
    let count = 0;
    let inside = false;
    let prev = "."

    for (let i = 0; i < imax; i++) {
        for (let j = 0; j < jmax; j++) {
            if (loop.findIndex(pos => pos.i === i && pos.j === j) === -1) {
                if (inside) {
                    count++;
                }
                continue;
            }

            switch (lines[i][j]) {
                case "|": {
                    inside = !inside;
                    break;
                }
                case "L": {
                    prev = lines[i][j];
                    break;
                }
                case "F": {
                    prev = lines[i][j];
                    break;
                }
                case "J": {
                    if (prev === "F") {
                        inside = !inside;
                    }
                    break;
                }
                case "7": {
                    if (prev === "L") {
                        inside = !inside;
                    }
                    break;
                }
            }

        }
    }

    return count;
}

export async function main10() {
    // const lines = EXAMPLE_06.split("\n").slice(1);
    const file = await fs.open("input/10.txt");
    const lines = (await file.readFile()).toString().split("\n");

    let start: Position = { i: 0, j: 0 };
    let i = 0;
    let j = 0;
    for (const line of lines) {
        j = line.indexOf("S");
        if (j !== -1) {
            start = { i: i, j: j };
            break;
        }
        i++;
    }

    let curr: Position = start;
    let next: Position = curr;

    if (curr.i >= 1) {
        if ("|7F".indexOf(lines[curr.i - 1][curr.j]) !== -1) {
            next = { i: curr.i - 1, j: curr.j };
        }
    }

    if (curr.i < lines.length - 1) {
        if ("|LJ".indexOf(lines[curr.i + 1][curr.j]) !== -1) {
            next = { i: curr.i + 1, j: curr.j };
        }
    }

    if (curr.j >= 1) {
        if ("-LF".indexOf(lines[curr.i][curr.j - 1]) !== -1) {
            next = { i: curr.i, j: curr.j - 1};
        }
    }

    if (curr.j < lines[0].length - 1) {
        if ("-J7".indexOf(lines[curr.i][curr.j + 1]) !== -1) {
            next = { i: curr.i, j: curr.j + 1};
        }
    }

    let nsteps = 0;
    let loop: Position[] = [];

    while (curr != next) {
        [curr, next] = [next, getNext(curr, next, lines[next.i][next.j])];
        loop.push(curr);
        nsteps++; 
    }

    console.log(Math.floor(nsteps / 2));
    lines[start.i] = lines[start.i].replace("S", "7"); // FIXME
    console.log(countInteriorTiles(loop, lines, lines.length, lines[0].length));
}