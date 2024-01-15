import * as fs from "node:fs/promises";
import { ObjectSet } from "./utils";

const EXAMPLE_01 =`
#.#####################
#.......#########...###
#######.#########.#.###
###.....#.>.>.###.#.###
###v#####.#v#.###.#.###
###.>...#.#.#.....#...#
###v###.#.#.#########.#
###...#.#.#.......#...#
#####.#.#.#######.#.###
#.....#.#.#.......#...#
#.#####.#.#.#########v#
#.#...#...#...###...>.#
#.#.#v#######v###.###v#
#...#.>.#...>.>.#.###.#
#####v#.#.###v#.#.###.#
#.....#...#...#.#.#...#
#.#########.###.#.#.###
#...###...#...#...#.###
###.###.#.###v#####v###
#...#...#.#.>.>.#.>.###
#.###.###.#.###.#.#v###
#.....###...###...#...#
#####################.#`;

const Directions = {
    N: 0,
    E: 1,
    S: 2,
    W: 3,
} as const;

type Grid = {
    rows: number;
    cols: number;
    checkDirections: boolean;
};

type Node = {
    id: string;
    i: number;
    j: number;
    neighbors: [number, number, number][];
};

type Connection = {
    start: Node;
    end: Node | undefined;
    length: number;
};

type Path = {
    nodes: string[];
    length: number;
};

function getNeighbors(i: number, j: number, puzzle: string[], grid: Grid) {
    let neighbors: [number, number, number][] = [
        [i - 1, j, Directions.N], [i + 1, j, Directions.S],
        [i, j - 1, Directions.W], [i, j + 1, Directions.E]
    ];

    return neighbors.filter(
        ([i, j, _]) => i >= 0 && j >= 0 && i < grid.rows && j < grid.cols && puzzle[i][j] !== "#"
    );
}

function explorePath(
    start: Node,
    next: [number, number],
    junctions: Map<string, Node>,
    puzzle: string[],
    grid: Grid
): Connection {

    let end: Node | undefined = undefined;
    let seen = new Set<string>();
    let length = 0;
    let points = [next];

    seen.add(start.id);

    while (points.length > 0) {
        length++;

        const [i, j] = points.shift()!;
        const id = `${i}|${j}`;

        seen.add(id);

        if (junctions.has(id)) {
            end = junctions.get(id);
            break;
        }

        for (const [ii, jj, dd] of getNeighbors(i, j, puzzle, grid)) {
            let iid = `${ii}|${jj}`;

            if (seen.has(iid)) {
                continue;
            }

            if (grid.checkDirections && (
                (puzzle[ii][jj] === "v" && dd !== Directions.S) ||
                (puzzle[ii][jj] === ">" && dd !== Directions.E) ||
                (puzzle[ii][jj] === "<" && dd !== Directions.W))) {
                continue;
            }

            seen.add(iid);
            points.push([ii, jj]);
        }
    }

    return { start: start, end: end, length: length };
}

function getJunctions(puzzle: string[], grid: Grid): Map<string, Node> {
    const junctions = new Map<string, Node>();

    for (let i = 0; i < grid.rows; i++) {
        for (let j = 0; j < grid.cols; j++) {
            if (puzzle[i][j] === "#") {
                continue;
            }

            let neighbors = getNeighbors(i, j, puzzle, grid);
            if (neighbors.length < 3) {
                continue;
            }

            let node: Node = { id: `${i}|${j}`, i: i, j: j, neighbors: neighbors };
            junctions.set(node.id, node);
        }
    }

    return junctions;
}

function getConnections(
    junctions: Map<string, Node>,
    puzzle: string[],
    grid: Grid): Map<string, Connection[]> {
    const connections = new Map<string, Connection[]>(); // nodeId (of start) -> list of paths

    for (const [id, node] of junctions.entries()) {
        for (const [i, j, direction] of node.neighbors) {
            if (!connections.has(id)) {
                connections.set(id, []);
            }

            if (grid.checkDirections && (
                (puzzle[i][j] === "v" && direction !== Directions.S) ||
                (puzzle[i][j] === ">" && direction !== Directions.E) ||
                (puzzle[i][j] === "<" && direction !== Directions.W))) {
                continue;
            }

            let path = explorePath(node, [i, j], junctions, puzzle, grid);
            if (path.end !== undefined) {
                connections.get(id)?.push(path);
            }
        }
    }

    return connections;
}

function findLongestPath(
    junctions: Map<string, Node>,
    connections: Map<string, Connection[]>,
    start: Node,
    end: Node): number {
    let longest = 0;
    let queue: Path[] = [{ nodes: [start.id], length: 0 }];

    while (queue.length > 0) {
        let curr = queue.pop()!;
        let last = junctions.get(curr.nodes.at(-1)!)!;

        for (const conn of connections.get(last.id)!) {
            if (curr.nodes.includes(conn.end!.id)) {
                continue;
            }

            let newLength = curr.length + conn.length;

            if (conn.end!.id === end.id && newLength > longest) {
                longest = newLength;
                continue;
            }

            queue.push({ nodes: curr.nodes.concat([conn.end!.id]), length: newLength });
        }
    }

    return longest;
}

export async function main23() {
    const file = await fs.open("input/23.txt");
    // const puzzle: string[] = EXAMPLE_01.split("\n").slice(1);
    const puzzle: string[] = (await file.readFile()).toString().split("\n").slice(0, -1);
    const grid: Grid = { rows: puzzle.length, cols: puzzle[0].length, checkDirections: true };

    const start: Node = {
        id: '0|1',
        i: 0,
        j: 1,
        neighbors: getNeighbors(0, 1, puzzle, grid),
    };

    const end: Node = {
        id: `${grid.rows - 1}|${grid.cols - 2}`,
        i: grid.rows - 1,
        j: grid.cols - 2,
        neighbors: getNeighbors(grid.rows - 1, grid.cols - 2, puzzle, grid),
    };

    const junctions = getJunctions(puzzle, grid);
    junctions.set(start.id, start);
    junctions.set(end.id, end);

    let connections = getConnections(junctions, puzzle, grid);
    console.log(findLongestPath(junctions, connections, start, end));

    grid.checkDirections = false;
    connections = getConnections(junctions, puzzle, grid);
    console.log(findLongestPath(junctions, connections, start, end));
}