import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`;

type Part = {
    x: number;
    m: number;
    a: number;
    s: number;
};

const Comparisons = new Map<string, (a: number, b: number) => boolean>();
Comparisons.set(">", (a: number, b: number) => a > b);
Comparisons.set("<", (a: number, b: number) => a < b);

function getProperty(p: Part, property: string): number {
    switch (property) {
        case "x":
            return p.x;
        case "m":
            return p.m;
        case "a":
            return p.a;
        case "s":
            return p.s;
        default:
            throw Error("Unknown property: " + property);
    }
}

function setProperty(p: Part, property: string, value: number): void {
    switch (property) {
        case "x":
            p.x = value;
            break;
        case "m":
            p.m = value;
            break;
        case "a":
            p.a = value;
            break;
        case "s":
            p.s = value;
            break;
        default:
            throw Error("Unknown property: " + property);
    }
}


function makeEvaluationFunction(rules: string): (p: Part) => string {
    let branches: any[] = [];

    for (const rule of rules.split(",")) {
        let parts = rule.split(":");

        if (parts.length === 1) {
            branches.push([(_: Part) => true, parts[0]])
            continue;
        }

        let [cond, target] = parts;
        let [property, op, value] = cond.split(/([<>])/g);

        branches.push([
            (p: Part) => Comparisons.get(op)!(getProperty(p, property), Number(value)),
            target
        ]);

    }
    const fun = (p: Part) => {
        for (let [cond, target] of branches) {
            if (cond(p)) {
                return target;
            }
        }
    }

    return fun;
}

export async function main19() {
    const file = await fs.open("input/19.txt");
    const lines = (await file.readFile()).toString().split("\n").slice(0, -1);
    // const lines = EXAMPLE_01.split("\n").slice(1);

    let workflows = new Map<string,(p: Part) => string>();
    let parts: Part[] = [];

    let i = 0;
    while (lines[i] !== "") {
        let [name, rules] = lines[i].split("{");

        workflows.set(name, makeEvaluationFunction(rules.slice(0, -1)));
        i++;
    }

    i++;
    while (i < lines.length) {
        let pairs = lines[i].slice(1, -1).split(",").map(p => p.split("="));
        let curr: Part = { x: 0, m: 0, a: 0, s: 0 };
        for (const [property, value] of pairs) {
            setProperty(curr, property, Number(value));
        }
        parts.push(curr);
        i++;
    }

    let total = 0;

    for (const part of parts) {
        let fun = workflows.get("in")!;
        let res = fun(part);

        while (res !== "A" && res !== "R") {
            fun = workflows.get(res)!;
            res = fun(part);

            if (res === "A") {
                total += part.x + part.m + part.a + part.s;
            }
        }
    }

    console.log(total);
}