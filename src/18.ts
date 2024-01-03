import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`;

type Vertex = {
    x: number;
    y: number;
};

function move({ x, y }: Vertex, direction: string, distance: number): Vertex {
    switch (direction) {
        case "R":
            return { x: x + distance, y: y };
        case "L":
            return { x: x - distance, y: y };
        case "U":
            return { x: x, y: y + distance };
        case "D":
            return { x: x, y: y - distance };
        default:
            throw Error("Unknown direction: " + direction);
    }
}

function area(vertices: Vertex[]): number {
    // Shoelace formula
    let A = 0;
    let n = vertices.length - 1;

    for (let i = 0; i < n; i++) {
        A += vertices[i].x * vertices[i + 1].y - vertices[i].y * vertices[i + 1].x;
    }

    A += vertices[n].x * vertices[0].y - vertices[n].y * vertices[0].x;

    return Math.abs(A / 2);
}

export async function main18() {
    let file = await fs.open("input/18.txt");

    let vertices: Vertex[] = [];
    let curr: Vertex = { x: 0, y: 0 };
    let boundary = 0;

    // for (const line of EXAMPLE_01.split("\n")) {
    for await (const line of file.readLines()) {
        if (line === "") {
            continue;
        }

        let [direction, distance, color] = line.split(" ");

        boundary += Number(distance);
        curr = move(curr, direction, Number(distance));
        vertices.push(curr);
    }

    // Pick's theorem
    console.log(area(vertices) + 1 - boundary / 2 + boundary);
}