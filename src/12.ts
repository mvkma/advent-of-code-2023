import { countReset } from "node:console";
import * as fs from "node:fs/promises"

const EXAMPLE_01 = `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`

function isValid(record: string, sizes: number[]): boolean {
    let blocksize = 0;
    let block = 0;

    for (let i = 0; i < record.length; i++) {
        if (record[i] === "?") {
            return true;
        }

        if (record[i] === "#") {
            blocksize++;
        }

        if (blocksize > 0 && record[i] === ".") {
            if (sizes[block] !== blocksize) {
                return false;
            }

            block++;
            blocksize = 0;
        }
    }

    if (blocksize > 0 &&
        (sizes[block] !== blocksize || block !== sizes.length - 1)) {
        return false;
    }

    if (blocksize === 0 && block !== sizes.length) {
        return false;
    }

    return true;
}

function isComplete(record: string): boolean {
    return record.indexOf("?") === -1;
}

function countArrangements(sizes: number[], record: string): number {
    let count = 0;
    let queue = [record];

    while (queue.length > 0) {
        let curr = queue.pop()!;

        if (isComplete(curr)) {
            count++;
            continue;
        }

        for (const rep of [".", "#"]) {
            let next = curr.replace("?", rep);
            if (isValid(next, sizes)) {
                queue.push(next);
            }
        }
    }

    return count;
}

let _cache = new Map<string, number>();

function countArrangementsRecursive(sizes: number[], record: string): number {
    let key = sizes.toString() + record;
    let val = 0;

    if (_cache.has(key)) {
        return _cache.get(key)!;
    }

    if (sizes.length === 0) {
        val = record.indexOf("#") !== -1 ? 0 : 1;
        _cache.set(key, val);
        return val;
    }

    if (record.length === 0) {
        let val = sizes.length !== 0 ? 0 : 1;
        _cache.set(key, val);
        return val;
    }

    let count = 0;

    if (record[0] === "." || record[0] === "?") {
        count += countArrangementsRecursive(sizes, record.slice(1));
    }

    if (record[0] === "#" || record[0] === "?") {
        if (sizes[0] <= record.length &&
            record.slice(0, sizes[0]).indexOf(".") === -1 &&
            (sizes[0] === record.length || record[sizes[0]] !== "#")) {
            count += countArrangementsRecursive(sizes.slice(1), record.slice(sizes[0] + 1));
        }
    }

    _cache.set(key, count);
    return count;
}

function getArrangements(line: string, repeat: number = 1): number {
    const parts = line.split(" ");

    let sizes = parts[1].trim().split(",").map(Number);
    let record = parts[0];

    if (repeat > 1) {
        sizes = (new Array(repeat)).fill(sizes).reduce((a, b) => a.concat(b));
        record = (new Array(repeat)).fill(record).reduce((a, b) => a + "?" + b);
    }

    return countArrangementsRecursive(sizes, record);
}

export async function main12() {
    const file = await fs.open("input/12.txt");

    let total = 0;
    // for (const line of EXAMPLE_01.split("\n").slice(1)) {
    for await (const line of file.readLines()) {
        total += getArrangements(line, 5);
    }
    console.log(total);
}