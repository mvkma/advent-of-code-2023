import * as fs from "node:fs/promises"

const EXAMPLE_01 = `
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`;

type Set = {
    red: number;
    green: number;
    blue: number;
};

type Game = {
    id: number;
    sets: Set[];
}

function parseSet(set: string): Set {
    let result: Set = { red: 0, green: 0, blue: 0 };

    for (const cubes of set.trim().split(",")) {
        const parts = cubes.trim().split(" ");

        if (parts.length !== 2) {
            console.log("Invalid cube: " + set);
            process.exit(1);
        }

        switch (parts[1]) {
            case "red":
                result.red = Number(parts[0]);
                continue;
            case "blue":
                result.blue = Number(parts[0]);
                continue;
            case "green":
                result.green = Number(parts[0]);
                continue;
            default:
                console.log("Invalid set: " + set);
                process.exit(1);
        }
    }

    return result;
};

function parseGame(line: string): Game {
    const parts = line.split(":");

    if (parts.length !== 2) {
        console.log("Invalid game: " + line);
        process.exit(1);
    }

    let game: Game = {
        id: Number(parts[0].trim().split(" ")[1].trim()),
        sets: []
    };

    for (const set of parts[1].split(";")) {
        game.sets.push(parseSet(set.trim()));
    }

    return game;
};

function isPossibleGame(game: Game, content: Set): boolean {
    for (const set of game.sets) {
        if (set.red > content.red ||
            set.blue > content.blue ||
            set.green > content.green) {
            return false
        }
    }

    return true;
};

function powerOfGame(game: Game): number {
    let minRed: number = 0;
    let minGreen: number = 0;
    let minBlue: number = 0;

    for (const set of game.sets) {
        if (set.red > minRed) {
            minRed = set.red;
        }

        if (set.green > minGreen) {
            minGreen = set.green;
        }

        if (set.blue > minBlue) {
            minBlue = set.blue;
        }
    }

    return minRed * minGreen * minBlue;
};

export async function main02() {
    const file = await fs.open("input/02.txt");

    const contentPart1: Set = { red: 12, green: 13, blue: 14 };

    let game: Game;
    let validGamesSum: number = 0;
    let powerOfGamesSum: number = 0;

    for await (const line of file.readLines()) {
    // for (const line of EXAMPLE_01.split("\n")) {
        if (line.length === 0) {
            continue;
        }

        game = parseGame(line);
        if (isPossibleGame(game, contentPart1)) {
            validGamesSum += game.id;
        }

        powerOfGamesSum += powerOfGame(game);
    }

    console.log(validGamesSum);
    console.log(powerOfGamesSum);
};