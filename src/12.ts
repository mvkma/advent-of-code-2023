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

function getArrangements(line: string): string[] {
    const parts = line.split(" ");

    const sizes = parts[1].trim().split(",").map(Number);
    const record = parts[0];

    let arrangements = [];
    let queue = [record];

    while (queue.length > 0) {
        let curr = queue.pop()!;

        if (isComplete(curr)) {
            arrangements.push(curr);
            continue;
        }

        for (const rep of [".", "#"]) {
            let next = curr.replace("?", rep);
            if (isValid(next, sizes)) {
                queue.push(next);
            }
        }
    }

    return arrangements;
}

export async function main12() {
    const file = await fs.open("input/12.txt");

    let total = 0;
    // for (const line of EXAMPLE_01.split("\n").slice(1)) {
    for await (const line of file.readLines()) {
        let arrangements = getArrangements(line);
        total += arrangements.length;
    }
    console.log(total);
}