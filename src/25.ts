import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr`;


function contractEdge(graph: Map<string, Set<string>>, a: string, b: string, sep: string = "|") {
    let sa = graph.get(a)!;
    let sb = graph.get(b)!;

    let s = new Set([...sa, ...sb]);
    s.delete(a);
    s.delete(b);

    graph.set(a + sep + b, s);
    graph.delete(a);
    graph.delete(b);

    for (const [k, v] of graph.entries()) {
        if (v.delete(b)) {
            v.add(a + sep + b);
        }

        if (v.delete(a)) {
            v.add(a + sep + b);
        }
    }
}

function contractGraph(graph: Map<string, Set<string>>, t: number, sep: string = "|") {
    while (graph.size > t) {
        let vertices = [...graph.keys()];

        let r = Math.floor(Math.random() * vertices.length);
        let a = vertices[r];
        let s = Math.floor(Math.random() * graph.get(a)!.size);
        let b = [...graph.get(a)!][s];

        contractEdge(graph, a, b, sep);
    }
}

function copyGraph(graph: Map<string, Set<string>>) {
    let newGraph = new Map<string, Set<string>>();

    for (const [k, v] of graph.entries()) {
        newGraph.set(k, new Set(v));
    }

    return newGraph;
}

function getConnectivity(graph: Map<string, Set<string>>, nodea: string[], nodeb: string[]) {
    let connectivity = 0;
    for (const a of nodea) {
        let sa = graph.get(a)!;

        for (const b of sa) {
            if (nodeb.includes(b)) {
                connectivity++;
            }
        }
    }

    return connectivity;
}

function cutSize(originalGraph: Map<string, Set<string>>): [number, string[]] {
    let graph = copyGraph(originalGraph);

    contractGraph(graph, 2);

    let vertices = [...graph.keys()];

    let connectivity = getConnectivity(
        originalGraph,
        vertices[0].split("|"),
        vertices[1].split("|"),
    );

    return [connectivity, vertices];
}

export async function main25() {
    const file = await fs.open("input/25.txt");
    let originalGraph = new Map<string, Set<string>>();

    // for (const line of EXAMPLE_01.split("\n")) {
    for await (const line of file.readLines()) {
        if (line === "") {
            continue;
        }

        let [from, to] = line.split(":").map(s => s.trim().split(" "));

        if (!originalGraph.has(from[0])) {
            originalGraph.set(from[0], new Set<string>());
        }

        for (const k of to) {
            originalGraph.get(from[0])?.add(k);

            if (!originalGraph.has(k)) {
                originalGraph.set(k, new Set<string>());
            }

            originalGraph.get(k)?.add(from[0]);
        }
    }

    while (true) {
        let [connectivity, vertices] = cutSize(originalGraph);

        if (connectivity === 3) {
            console.log(vertices[0].split("|").length * vertices[1].split("|").length);
            break;
        }
    }
}