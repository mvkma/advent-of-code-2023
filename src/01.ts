import * as fs from "node:fs/promises"

const RE_DIGITS = /0|1|2|3|4|5|6|7|8|9/g;
const RE_DIGITS_WITH_NAMES = /(?=(one|two|three|four|five|six|seven|eight|nine|zero))|0|1|2|3|4|5|6|7|8|9/g

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

const EXAMPLE_01 = `
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`

const EXAMPLE_02 = `
two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen`

function extractDigits(line : string, withStrings : boolean = false): string[] {
    let digits = [];

    if (withStrings) {
        for (const match of line.matchAll(RE_DIGITS_WITH_NAMES)) {
            if (match[0].length === 1) {
                digits.push(match[0]);
            } else {
                digits.push(STRINGS_TO_DIGITS.get(match[1])!);
            }
        }
    } else {
        for (const match of line.matchAll(RE_DIGITS)) {
            digits.push(match[0]);
        }
    }

    return digits;
}

export async function main01() {
    const file = await fs.open("input/01.txt");

    let total_part1: number = 0;
    let total_part2: number = 0;

    for await (const line of file.readLines()) {
        let digits_part1 = extractDigits(line, false);
        let digits_part2 = extractDigits(line, true);

        if (digits_part1.length !== 0) {
            total_part1 += Number(digits_part1[0] + digits_part1[digits_part1.length - 1])
        }

        if (digits_part2.length !== 0) {
            total_part2 += Number(digits_part2[0] + digits_part2[digits_part2.length - 1])
        }
    }

    console.log(total_part1);
    console.log(total_part2);
};