import * as fs from "node:fs/promises"

const DIGITS = "0123456789";

export async function main01() {
    const file = await fs.open("input/01.txt");

    let total: number = 0;

    for await (const line of file.readLines()) {
        let digits = [];

        for (const c of line) {
            if (DIGITS.includes(c)) {
                digits.push(c);
            }
        }

        total += Number(digits[0] + digits[digits.length -1])
    }

    console.log(total);
};