import * as fs from "node:fs/promises"

const EXAMPLE_01 = `
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`

type Card = {
    winning: number[];
    selected: number[];
    multiplicity: number;
    score: number;
};

function parseCard(line: string): Card {
    const parts = line.split(":")[1].split("|").map(
        s => s.trim().split(/\W+/).map(Number)
    );

    return {
        score: 0,
        multiplicity: 1,
        winning: parts[0],
        selected: parts[1],
    };
}

function scoreCard(card: Card): number {
    let matches = 0;

    for (const n of card.selected) {
        if (card.winning.indexOf(n) !== -1) {
            matches += 1;
        }
    }

    return matches;
}

export async function main04() {
    const file = await fs.open("input/04.txt");

    let total = 0;
    let card: Card;
    let cards: Card[] = [];

    for await (const line of file.readLines()) {
    // for (const line of EXAMPLE_01.split("\n")) {
        if (line.length <= 1) {
            continue;
        }

        card = parseCard(line);

        card.score = scoreCard(card);
        total += card.score > 0 ? 2**(card.score - 1) : 0;

        cards.push(card);
    }

    console.log(total);

    for (let i = 0; i < cards.length; i++) {
        card = cards[i];
        for (let j = 0; j < card.score; j++) {
            cards[j + i + 1].multiplicity += card.multiplicity;
        }
    }
    
    console.log(cards.map(c => c.multiplicity).reduce((a, b) => a + b));
}