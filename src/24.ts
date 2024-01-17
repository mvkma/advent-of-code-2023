import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`;

type Vec3D = [bigint, bigint, bigint];

type Vec2D = [bigint, bigint];

type Line = {
    pos: Vec2D | Vec3D;
    dir: Vec2D | Vec3D;
};

function add(a: bigint[], b: bigint[]): bigint[] {
    return a.map((n, i) => n + b[i]);
}

function mul(a: bigint, b: bigint[]): bigint[] {
    return b.map(n => a * n);
}

function cross(a: Vec3D, b: Vec3D): Vec3D {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function toMatrix(a: bigint[]): bigint[][] {
    return [ [0n, -a[2], a[1]], [a[2], 0n, -a[0]], [-a[1], a[0], 0n], ];
}

function det(mat: bigint[][]): bigint {
    if (mat.length === 1) {
        return mat[0][0];
    }

    let [first, ...rest] = mat;

    return first.map(
        (n, i) => (i % 2 == 0 ? 1n : -1n) * n * det(rest.map(c => c.toSpliced(i, 1)))
    ).reduce((a, b) => a + b, 0n);
}

function cramer(A: bigint[][], b: bigint[]) {
    let detA = det(A);

    let coeffs = [];
    for (let i = 0; i < A.length; i++) {
        let minor = A.map((r, j) => r.toSpliced(i, 1).concat(b[j]));
        coeffs.push((i % 2 === 0 ? -1n : 1n) * det(minor) / detA);
    }

    return coeffs;
}

function proj2D(vec: Vec3D): Vec2D {
    return [vec[0], vec[1]];
}

function futureIntersectionPoint(lineA: Line, lineB: Line) {
    let d0 = lineA.pos[0] - lineB.pos[0];
    let d1 = lineA.pos[1] - lineB.pos[1];

    let det = lineB.dir[0] * lineA.dir[1] - lineB.dir[1] * lineA.dir[0];

    if (det === 0n) {
        return undefined;
    }

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

    // for (const line of EXAMPLE_01.split("\n").slice(1)) {
    for await (const line of file.readLines()) {
        if (line === "") {
            continue;
        }

        let [pos, vel] = line.split("@").map(s => s.trim().split(",").map(BigInt))

        positions.push(pos as [bigint, bigint, bigint]);
        velocities.push(vel as [bigint, bigint, bigint])
    }

    // const bounds = [7, 27];
    const bounds = [200000000000000n, 400000000000000n];
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

    let rhs = Array.prototype.concat(
        add(cross(positions[1], velocities[1]), mul(-1n, cross(positions[0], velocities[0]))),
        add(cross(positions[2], velocities[2]), mul(-1n, cross(positions[0], velocities[0])))
    );

    let mat1 = toMatrix(add(velocities[0], mul(-1n, velocities[1])));
    let mat2 = toMatrix(add(mul(-1n, positions[0]), positions[1]));

    let mat3 = toMatrix(add(velocities[0], mul(-1n, velocities[2])));
    let mat4 = toMatrix(add(mul(-1n, positions[0]), positions[2]));

    let mat = [];
    mat.push(...mat1.map((r, i) => r.concat(mat2[i])));
    mat.push(...mat3.map((r, i) => r.concat(mat4[i])));

    let res = cramer(mat, rhs);

    console.log(Number(res[0] + res[1] + res[2]));
}