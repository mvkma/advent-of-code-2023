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

const EXAMPLE_03 = `
LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`

type Directions = {
    left: string;
    right: string;
}

function countSteps(
    instructions: string,
    network: Map<string, Directions>,
    start: string,
    endCondition: Function
): number {
    let i = 0;
    let nsteps = 0;
    let curr = start;

    while (!endCondition(curr)) {
        if (instructions[i] === "L") {
            curr = network.get(curr)!.left;
        } else {
            curr = network.get(curr)!.right;
        }
        nsteps++;
        i++;
        i %= instructions.length;
    }

    return nsteps;
}

function xgcd(a: number, b: number): number[] {
    let [r1, r2] = [a, b];
    let [s1, s2] = [1, 0];
    let [t1, t2] = [0, 1];

    let q: number;

    while (r2 !== 0) {
        q = Math.floor(r1 / r2);
        [r1, r2] = [r2, r1 - q * r2];
        [s1, s2] = [s2, s1 - q * s2];
        [t1, t2] = [t2, t1 - q * t2];
    }

    return [r1, s1, t1];
}

function lcm(a: number, b: number): number {
    return a * b / xgcd(a, b)[0];
}

export async function main08() {
    const file = await fs.open("input/08.txt");

    const [instructions, _, ...nodes] = (await file.readFile()).toString().trim().split("\n");
    // const [instructions, _, ...nodes] = EXAMPLE_03.trim().split("\n");

    const network = new Map<string, Directions>();

    for (const node of nodes) {
        const [source, targets] = node.split(" = ");
        const [left, right] = targets.slice(1, -1).split(", ");

        network.set(source, { left: left, right: right });
    }

    console.log(countSteps(instructions, network, "AAA", (s: string) => s === "ZZZ"));

    const startingNodes =[];
    for (const node of network.keys()) {
        if (node.endsWith("A")) {
            startingNodes.push(node);
        }
    }

    const cycles = startingNodes.map(
        node => countSteps(instructions, network, node, (s: string) => s.endsWith("Z"))
    );

    console.log(cycles.reduce((s, n) => lcm(s, n)));
}