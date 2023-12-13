import * as fs from "node:fs/promises";

const EXAMPLE_01 = `
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`

const Hands = {
    FiveOfAKind: 6,  // 50000
    FourOfAKind: 5,  // 41000
    FullHouse: 4,    // 32000
    ThreeOfAKind: 3, // 31100
    TwoPair: 2,      // 22100
    OnePair: 1,      // 21110
    HighCard: 0,     // 11111
} as const;

const CardValues = new Map<string, number>([
    ["A", 14],
    ["K", 13],
    ["Q", 12],
    ["J", 11],
    ["T", 10],
    ["9", 9],
    ["8", 8],
    ["7", 7],
    ["6", 6],
    ["5", 5],
    ["4", 4],
    ["3", 3],
    ["2", 2],
]);

type Card = {
    label: string;
}

type Hand = {
    cards: string;
    type: typeof Hands[keyof typeof Hands];
    bid: number;
}

function makeHand(cards: string, bid: string): Hand {
    const countsPerCard = new Map<string, number>();

    for (const c of cards) {
        if (countsPerCard.has(c)) {
            countsPerCard.set(c, countsPerCard.get(c)! + 1);
        } else {
            countsPerCard.set(c, 1);
        }
    }

    const counts = Array.from(countsPerCard.values()).sort().reduce((x, n, i) => x + 10 ** i * n);

    switch (counts) {
        case 5:
            return { cards: cards, bid: Number(bid), type: Hands.FiveOfAKind };
        case 41:
            return { cards: cards, bid: Number(bid), type: Hands.FourOfAKind };
        case 32:
            return { cards: cards, bid: Number(bid), type: Hands.FullHouse };
        case 311:
            return { cards: cards, bid: Number(bid), type: Hands.ThreeOfAKind };
        case 221:
            return { cards: cards, bid: Number(bid), type: Hands.TwoPair };
        case 2111:
            return { cards: cards, bid: Number(bid), type: Hands.OnePair };
        default:
            return { cards: cards, bid: Number(bid), type: Hands.HighCard };
    }
}

function compare(a: Hand, b: Hand): number {
    if (a.type < b.type) {
        return -1;
    }

    if (a.type > b.type) {
        return 1;
    }

    let i = 0;
    while (a.cards[i] === b.cards[i]) {
        i++;
    }

    return CardValues.get(a.cards[i])! - CardValues.get(b.cards[i])!;
}

export async function main07() {
    const file = await fs.open("input/07.txt");

    const hands: Hand[] = [];

    for await (const line of file.readLines()) {
        // for (const line of EXAMPLE_01.split("\n")) {
        if (line === "") {
            continue;
        }

        const [cards, bid] = line.trim().split(" ");

        hands.push(makeHand(cards, bid));
    }

    const winning = hands.sort(compare).reduce((s, hand, i) => s + hand.bid * (i + 1), 0);

    console.log(winning);
}