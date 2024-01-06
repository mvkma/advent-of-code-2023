import * as fs from "node:fs/promises";

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
    FlipFlop: "FlipFlop",
    Conjunction: "Conjunction",
    Broadcast: "Broadcast",
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

function processPulse(module: Module, pulse: Pulse): Pulse[] | undefined {
    switch (module.type) {
        case "FlipFlop":
            if (pulse.type === 1) {
                return undefined;
            }

            module.state = ((module.state as number) + 1) % 2;
            return module.destinations.map(d => { return { type: module.state, from: module.name, to: d } as Pulse; });

        case "Conjunction":
            let state = module.state as Map<string, number>;
            state.set(pulse.from, pulse.type);

            for (const v of state.values()) {
                if (v === 0) {
                    return module.destinations.map(d => { return { type: 1, from: module.name, to: d } as Pulse; });
                }
            }

            return module.destinations.map(d => { return { type: 0, from: module.name, to: d } as Pulse; });

        case "Broadcast":
            return module.destinations.map(d => { return { type: pulse.type, from: module.name, to: d } as Pulse; });
    }
}

function propagate(modules: Map<string, Module>, pulses: Pulse[]) {
    let pulseCount: [number, number] = [0, 0];

    while (pulses.length > 0) {
        let pulse = pulses[0];
        pulses = pulses.slice(1);

        pulseCount[pulse.type]++;

        // console.log();
        // console.log("Pulse: ", pulse);

        let module = modules.get(pulse.to);
        if (module === undefined) {
            continue;
        }

        let newPulses = processPulse(module, pulse);

        // console.log(module);
        // console.log(newPulses);

        if (newPulses !== undefined) {
            pulses.push(...newPulses);
        }
    }

    return pulseCount;
}

export async function main20() {
    let file = await fs.open("input/20.txt");
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

    let totalPulseCount: [number, number] = [0, 0];
    for (let i = 0; i < 1000; i++) {
        let pulseCount = propagate(modules, [{ type: 0, from: "button", to: "broadcaster" }]);
        totalPulseCount[0] += pulseCount[0];
        totalPulseCount[1] += pulseCount[1];
    }
    console.log(totalPulseCount[0] * totalPulseCount[1]);
}

