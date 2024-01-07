import * as fs from "node:fs/promises";
import { lcm } from "./utils";

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