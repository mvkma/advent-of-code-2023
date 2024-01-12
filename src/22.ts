import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9`;

type Brick = {
    x: [number, number];
    y: [number, number];
    z: [number, number];
};

type BrickZSlice = {
    x: [number, number];
    y: [number, number];
}

type Grid = {
    x: number;
    y: number;
    z: number;
};

function overlap(a: BrickZSlice, b: BrickZSlice) {
    if (a.x[0] >= b.x[1] || a.y[0] >= b.y[1]) {
        return false;
    }

    if (b.x[0] >= a.x[1] || b.y[0] >= a.y[1]) {
        return false;
    }

    return true;
}

function printBricks(bricks: Brick[], slices: Map<number, number[]>, grid: Grid) {
    for (let z = grid.z - 1; z > 0; z--) {
        let zslices = slices.get(z)!;

        let linex = "";
        for (let x = 0; x < grid.x; x++) {
            let symb = ".";

            for (const i of zslices) {
                let brick = bricks[i];
                if (brick.x[0] <= x && x < brick.x[1]) {
                    if (symb === ".") {
                        symb = (i % 10).toString();
                    } else {
                        symb = "?";
                    }
                }
            }

            linex += symb;
        }

        let liney = "";
        for (let y = 0; y < grid.y; y++) {
            let symb = ".";

            for (const i of zslices) {
                let brick = bricks[i];
                if (brick.y[0] <= y && y < brick.y[1]) {
                    if (symb === ".") {
                        symb = (i % 10).toString();
                    } else {
                        symb = "?";
                    }
                }
            }

            liney += symb;
        }

        console.log(linex, " | ", liney, " | ", z);
    }

}

function step(bricks: Brick[], slices: Map<number, number[]>): Set<number> {
    let moved = new Set<number>();

    for (let i = 0; i < bricks.length; i++) {
        let curr = bricks[i];
        if (curr.z[0] === 1) {
            continue;
        }

        let can_move = true;
        for (const ix of slices.get(curr.z[0] - 1)!) {
            let c = bricks[ix];
            if (overlap({ x: c.x, y: c.y }, { x: curr.x, y: curr.y })) {
                can_move = false;
                break;
            }
        }

        if (!can_move) {
            continue;
        }

        curr.z = [curr.z[0] - 1, curr.z[1] - 1];
        slices.get(curr.z[0])!.push(i);
        slices.get(curr.z[1])?.splice(slices.get(curr.z[1])?.indexOf(i)!, 1);
        moved.add(i);
    }

    return moved;
}

function computeSupport(bricks: Brick[], slices: Map<number, number[]>) {
    let supportedBy = new Map<number, number[]>();
    let supports = new Map<number, number[]>();

    for (let i = 0; i < bricks.length; i++) {
        let curr = bricks[i];

        supports.set(i, []);
        // for (const j of slices.get(curr.z[0] + 1)!) {
        for (const j of slices.get(curr.z[1])!) {
            if (i === j) {
                continue;
            }

            let other = bricks[j];
            if (overlap({ x: other.x, y: other.y }, { x: curr.x, y: curr.y })) {
                supports.get(i)?.push(j);
            }
        }

        supportedBy.set(i, []);

        if (curr.z[0] === 1) {
            continue;
        }

        for (const j of slices.get(curr.z[0] - 1)!) {
            let other = bricks[j];
            if (overlap({ x: other.x, y: other.y }, { x: curr.x, y: curr.y })) {
                supportedBy.get(i)?.push(j);
            }
        }

    }

    return [supportedBy, supports];
}

export async function main22() {
    const file = await fs.open("input/22.txt");

    let grid: Grid = { x: 0, y: 0, z: 0 };
    let bricks: Brick[] = [];
    let slices = new Map<number, number[]>();

    // for (const line of EXAMPLE_01.split("\n").slice(1)) {
    for await (const line of file.readLines()) {
        if (line ===  "") {
            continue;
        }

        let [start, end] = line.split("~").map(s => s.split(",").map(Number));
        let brick: Brick = {
            x: [start[0], end[0] + 1],
            y: [start[1], end[1] + 1],
            z: [start[2], end[2] + 1],
        };

        bricks.push(brick);
        grid.x = Math.max(grid.x, brick.x[1]);
        grid.y = Math.max(grid.y, brick.y[1]);
        grid.z = Math.max(grid.z, brick.z[1]);

        for (let z = brick.z[0]; z < brick.z[1]; z++) {
            if (!slices.has(z)) {
                slices.set(z, []);
            }

            slices.get(z)?.push(bricks.length - 1);
        }
    }

    for (let z = 1; z <= grid.z; z++) {
        if (!slices.has(z)) {
            slices.set(z, []);
        }
    }

    // printBricks(bricks, slices, grid);

    let done = false;
    while (!done) {
        done = step(bricks, slices).size === 0;
    }

    // printBricks(bricks, slices, grid);

    let [supportedBy, supports] = computeSupport(bricks, slices);

    let removable = new Set<number>();
    let nonRemovable = new Set<number>();
    for (const [i, js] of supports.entries()) {
        let can_remove = true;
        for (const j of js) {
            if (supportedBy.get(j)!.length === 1) {
                can_remove = false;
                break;
            }
        }

        if (can_remove) {
            removable.add(i);
        } else {
            nonRemovable.add(i);
        }
    }
    console.log(removable.size);

    let fallen = new Map<number, Set<number>>();

    for (const i of nonRemovable) {
        let newBricks: Brick[] = bricks.map(b => { return { x: b.x, y: b.y, z: b.z } });
        newBricks.splice(i, 1);

        let newSlices = new Map<number, number[]>();

        for (const k of slices.keys()) {
            let v = slices.get(k)!.slice();

            if (v.indexOf(i) !== -1) {
                v.splice(v.indexOf(i), 1);
            }
            newSlices.set(k, v.map(ix => ix >= i ? ix - 1 : ix));
        }

        fallen.set(i, new Set<number>());
        while (true) {
            let fallenSet = fallen.get(i)!;
            let oldNum = fallenSet.size;
            step(newBricks, newSlices).forEach(n=> fallenSet.add(n));
            if (oldNum === fallenSet.size) {
                break;
            }
        }
    }

    let total = 0;
    fallen.forEach((v, _) => total += v.size);
    console.log(total);
}