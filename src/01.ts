import * as fs from "node:fs/promises"

const DIGITS = "0123456789";
const DIGITS_REGEX = /(?=(one|two|three|four|five|six|seven|eight|nine|zero))|0|1|2|3|4|5|6|7|8|9/g

const STRINGS_TO_DIGITS = new Map<string, string>([
    ["one", "1"],
    ["two", "2"],
    ["three", "3"],
    ["four", "4"],
    ["five", "5"],
    ["six", "6"],
    ["seven", "7"],
    ["eight", "8"],
    ["nine", "9"],
    ["zero", "0"],
]);

export async function main01() {
    const file = await fs.open("input/01.txt");

    let total_part1: number = 0;
    let total_part2: number = 0;

    for await (const line of file.readLines()) {
        let digits_part1 = [];
        let digits_part2 = [];

        for (const c of line) {
            if (DIGITS.includes(c)) {
                digits_part1.push(c);
            }
        }

        for (const match of line.matchAll(DIGITS_REGEX)) {
            if (match[0].length === 1) {
                digits_part2.push(match[0]);
            } else {
                digits_part2.push(STRINGS_TO_DIGITS.get(match[1])!);
            }
        }

        console.log(line, digits_part1, digits_part2);

        total_part1 += Number(digits_part1[0] + digits_part1[digits_part1.length - 1])
        total_part2 += Number(digits_part2[0] + digits_part2[digits_part2.length - 1])
    }

    console.log(total_part1);
    console.log(total_part2);
};