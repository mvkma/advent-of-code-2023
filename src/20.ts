import * as fs from "node:fs/promises";
import { lcm } from "./utils";

const EXAMPLE_01 = `
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`;

const EXAMPLE_02 = `
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`;

const ModuleTypes = {
    FlipFlop: 0,
    Conjunction: 1,
    Broadcast: 2,
} as const;

type Module = {
    type: typeof ModuleTypes[keyof typeof ModuleTypes];
    name: string;
    destinations: string[];
    state: number | Map<string, number> | undefined;
};

type Pulse = {
    type: number;
    from: string,
    to: string;
};

function parseModule(line: string): Module {
    if (line[0] === "%") {
        let parts = line.slice(1).split("->");
        return {
            type: ModuleTypes.FlipFlop,
            name: parts[0].trim(),
            destinations: parts[1].trim().split(",").map(s => s.trim()),
            state: 0,
        };
    }

    if (line[0] === "&") {
        let parts = line.slice(1).split("->");
        return {
            type: ModuleTypes.Conjunction,
            name: parts[0].trim(),
            destinations: parts[1].trim().split(",").map(s => s.trim()),
            state: new Map<string, number>(),
        };
    }

    let parts = line.split("->");
    return {
        type: ModuleTypes.Broadcast,
        name: parts[0].trim(),
        destinations: parts[1].trim().split(",").map(s => s.trim()),
        state: undefined,
    };
}

function processPulse(module: Module, pulse: Pulse, pulses: Pulse[]): void {
    switch (module.type) {
        case ModuleTypes.FlipFlop:
            if (pulse.type === 1) {
                return;
            }

            module.state = ((module.state as number) + 1) % 2;
            module.destinations.forEach(d => pulses.push({ type: module.state, from: module.name, to: d } as Pulse));
            return;

        case ModuleTypes.Conjunction:
            let state = module.state as Map<string, number>;
            state.set(pulse.from, pulse.type);

            for (const v of state.values()) {
                if (v === 0) {
                    module.destinations.forEach(d => pulses.push({ type: 1, from: module.name, to: d } as Pulse));
                    return;
                }
            }

            module.destinations.forEach(d => pulses.push({ type: 0, from: module.name, to: d } as Pulse));
            return;

        case ModuleTypes.Broadcast:
            module.destinations.forEach(d => pulses.push({ type: pulse.type, from: module.name, to: d } as Pulse));
            return;
    }
}

function propagate(modules: Map<string, Module>, pulses: Pulse[]) {
    let pulseCount: [number, number] = [0, 0];

    while (pulses.length > 0) {
        let pulse = pulses.shift()!;

        pulseCount[pulse.type]++;

        let module = modules.get(pulse.to);
        if (module === undefined) {
            continue;
        }

        processPulse(module, pulse, pulses);
    }

    return pulseCount;
}

function propagateWithOutput(modules: Map<string, Module>, pulses: Pulse[], output: string) {
    let seen = new Map<string, boolean>();

    while (pulses.length > 0) {
        let pulse = pulses.shift()!;

        if (pulse.type === 1 && pulse.to === output) {
            seen.set(pulse.from, true);
        }

        let module = modules.get(pulse.to);
        if (module === undefined) {
            continue;
        }

        processPulse(module, pulse, pulses);
    }

    return seen;
}


async function readModules(filename: string): Promise<Map<string, Module>> {
    let file = await fs.open(filename);
    let modules = new Map<string, Module>();

    // for (const line of EXAMPLE_01.split("\n")) {
    // for (const line of EXAMPLE_02.split("\n")) {
    for await (const line of file.readLines()) {
        if (line === "") {
            continue;
        }

        let module = parseModule(line);
        modules.set(module.name, module);
    }

    for (const name of modules.keys()) {
        for (const dest of modules.get(name)!.destinations) {
            let targetModule = modules.get(dest);
            if (targetModule === undefined) {
                continue;
            }

            if (targetModule.type === ModuleTypes.Conjunction) {
                let state = targetModule.state as Map<string, number>;
                state.set(name, 0);
            }
        }
    }

    return modules;
}

export async function main20() {
    let modules = await readModules("input/20.txt");

    let totalPulseCount: [number, number] = [0, 0];
    for (let i = 0; i < 1000; i++) {
        let pulseCount = propagate(modules, [{ type: 0, from: "button", to: "broadcaster" }]);
        if (pulseCount !== undefined) {
            totalPulseCount[0] += pulseCount[0];
            totalPulseCount[1] += pulseCount[1];
        }
    }
    console.log(totalPulseCount[0] * totalPulseCount[1]);

    modules = await readModules("input/20.txt");

    let rx_input = "";
    let cycle_lengths = new Map<string, number>();

    for (const module of modules.values()) {
        if (module.destinations.includes("rx")) {
            rx_input = module.name;

            let state = module.state as Map<string, number>;
            state.forEach((_, k) => cycle_lengths.set(k, 0));

            break;
        }
    }

    let count = 0;
    let finished = false;
    while (!finished) {
        count++;

        let seen = propagateWithOutput(modules, [{ type: 0, from: "button", to: "broadcaster" }], rx_input);

        for (const name of seen.keys()) {
            if (cycle_lengths.get(name) === 0) {
                cycle_lengths.set(name, count);
            }
        }

        finished = true;
        for (const value of cycle_lengths.values()) {
            if (value === 0) {
                finished = false;
            }
        }
    }

    let prod = 1;
    for (const value of cycle_lengths.values()) {
        prod = lcm(prod, value);
    }

    console.log(prod);
}

