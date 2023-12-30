export type Heap<T> = {
    insert: (priority: number, item: T) => void;
    pop: () => T | undefined;
    size: () => number;
}

export type Entry<T> = {
    priority: number;
    value: T;
}

export function heap<T>(): Heap<T> {
    let data: Entry<T>[] = [];

    const getParent = (i: number) => Math.floor((i - 1) / 2);
    const getLeft = (i: number) => 2 * i + 1;
    const getRight = (i: number) => 2 * i + 2;

    const insert = (priority: number, value: T) => {
        data.push({ priority: priority, value: value });

        let i = data.length - 1;
        let s: number; // swap

        while (i > 0) {
            s = getParent(i);
            if (data[s].priority < data[i].priority) {
                break;
            }

            [data[i], data[s]] = [data[s], data[i]];
            i = s;
        }
    };

    const pop = () => {
        if (data.length === 0) {
            return undefined;
        }

        [data[0], data[data.length - 1]] = [data[data.length - 1], data[0]];

        const item = data.pop();

        let curr = 0;
        while (getLeft(curr) < data.length) {
            let lchild = getLeft(curr);
            let rchild = getRight(curr);
            let swap = lchild;

            if ((rchild < data.length) &&
                (data[rchild].priority < data[lchild].priority)
            ) {
                swap = rchild
            }

            if (data[swap].priority > data[curr].priority) {
                break;
            }

            [data[curr], data[swap]] = [data[swap], data[curr]];
            curr = swap;
        }

        return item?.value;
    };

    const size = () => {
        return data.length;
    };

    return { insert, pop, size };
}

export function floyd(seq: any[]): [number, number] {
    let t = 1;
    let h = 2;

    while (seq[t] !== seq[h]) {
        t += 1;
        h += 2;
    }

    let mu = 0;
    t = 0;

    while (seq[t] !== seq[h]) {
        t++;
        h++;
        mu++;
    }

    let lam = 1;
    h = t + 1;

    while (seq[t] !== seq[h]) {
        h++;
        lam++;
    }

    return [mu, lam];
}


export function brent(seq: any[]): [number, number] {
    let exp = 1;
    let lam = 1;
    let t = 0;
    let h = 1;

    while (seq[t] !== seq[h]) {
        if (exp === lam) {
            t = h;
            exp *= 2;
            lam = 0;
        }

        h += 1;
        lam += 1;
    }

    t = 0;
    h = lam;
    let mu = 0;
    while (seq[t] !== seq[h]) {
        t += 1;
        h += 1;
        mu += 1;
    }

    return [mu, lam];
}

export class ObjectSet<T> extends Set {
    add(elem: T): this {
        return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }

    delete(elem: T): boolean {
        return super.delete(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }

    has(elem: T) {
        return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
}