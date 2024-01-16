import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`;

type Vec3D = [number, number, number];

type Vec2D = [number, number];

type Line = {
    pos: Vec2D | Vec3D;
    dir: Vec2D | Vec3D;
};

function proj2D(vec: Vec3D): Vec2D {
    return [vec[0], vec[1]];
}

function futureIntersectionPoint(lineA: Line, lineB: Line) {
    let d0 = lineA.pos[0] - lineB.pos[0];
    let d1 = lineA.pos[1] - lineB.pos[1];

    let det = lineB.dir[0] * lineA.dir[1] - lineB.dir[1] * lineA.dir[0];

    let lam = (lineB.dir[1] * d0 - lineB.dir[0] * d1) / det;
    let mu = (lineA.dir[1] * d0 - lineA.dir[0] * d1) / det;

    if (lam < 0 || mu < 0) {
        return undefined;
    }

    return [
        lineA.pos[0] + lam * lineA.dir[0],
        lineA.pos[1] + lam * lineA.dir[1],
    ];
}

export async function main24() {
    const file = await fs.open("input/24.txt");

    let positions: Vec3D[] = [];
    let velocities: Vec3D[] = [];

    for (const line of EXAMPLE_01.split("\n").slice(1)) {
    // for await (const line of file.readLines()) {
        if (line === "") {
            continue;
        }

        let [pos, vel] = line.split("@").map(s => s.trim().split(",").map(Number))

        positions.push(pos as [number, number, number]);
        velocities.push(vel as [number, number, number])
    }

    const bounds = [7, 27];
    // const bounds = [200000000000000, 400000000000000];
    let total = 0;

    for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
            let lineA: Line = { pos: positions[i], dir: velocities[i] };
            let lineB: Line = { pos: positions[j], dir: velocities[j] };
            let point = futureIntersectionPoint(lineA, lineB);

            if (point === undefined) {
                continue;
            }

            let valid = true;
            for (let k = 0; k < point.length; k++) {
                if (point[k] < bounds[0] || point[k] > bounds[1]) {
                    valid = false;
                    break;
                }
            }

            // console.log(lineA, lineB, point, valid);
            if (valid) {
                total++;
            }
        }
    }
    console.log(total);
}