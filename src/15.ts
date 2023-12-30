import * as fs from "node:fs/promises";

const EXAMPLE_01 = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`;

function hash(input: string): number {
    let value = 0;

    for (const c of input) {
        value += c.charCodeAt(0);
        value *= 17;
        value %= 256;
    }

    return value;
}

export async function main15() {
    const file = await fs.open("input/15.txt");
    const steps = (await file.readFile()).toString().trim().split(",");
    // const steps = EXAMPLE_01.split(",");

    const total = steps.map(hash).reduce((a, b) => a + b, 0);
    console.log(total);

    let boxes: Map<string, number>[] = new Array(256);
    for (let i = 0; i < boxes.length; i++) {
        boxes[i] = new Map<string, number>();
    }

    for (const step of steps) {
        if (step[step.length - 1] === "-") {
            let box = step.slice(0, step.length - 1);
            boxes[hash(box)].delete(box);
        } else {
            let parts = step.split("=");
            let box = hash(parts[0]);
            let lens = Number(parts[1]);
            boxes[box].set(parts[0], lens);
        }
    }

    let power = 0;
    for (let i = 0; i < boxes.length; i++) {
        let slot = 1;
        for (const lens of boxes[i].values()) {
            power += (i + 1) * slot * lens;
            slot++;
        }
    }
    console.log(power);
}