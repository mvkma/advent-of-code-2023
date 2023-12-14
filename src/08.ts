import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`

const EXAMPLE_02 = `
LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`

type Directions = {
    left: string;
    right: string;
}

export async function main08() {
    const file = await fs.open("input/08.txt");

    const [instructions, _, ...nodes] = (await file.readFile()).toString().trim().split("\n");
    // const [instructions, _, ...nodes] = EXAMPLE_02.trim().split("\n");

    const network = new Map<string, Directions>();

    for (const node of nodes) {
        const [source, targets] = node.split(" = ");
        const [left, right] = targets.slice(1, -1).split(", ");

        network.set(source, { left: left, right: right });
    }

    let i = 0;
    let nsteps = 0;
    let curr = "AAA";

    while (curr !== "ZZZ") {
        if (instructions[i] === "L") {
            curr = network.get(curr)!.left;
        } else {
            curr = network.get(curr)!.right;
        }
        nsteps++;
        i++;
        i %= instructions.length;
    }

    console.log(nsteps);
}