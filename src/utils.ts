export type Heap<T> = {
    insert: (priority: number, item: T) => void;
    pop: () => (number | undefined | T)[] | undefined;
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

        return [item?.priority, item?.value];
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

export class ObjectMap<T, U> extends Map {
    set(key: T, value: U): this {
        return super.set(typeof key === 'object' ? JSON.stringify(key) : key, value);
    }

    get(key: T) {
        return super.get(typeof key === 'object' ? JSON.stringify(key) : key);
    }

    delete(key: T): boolean {
        return super.delete(typeof key === 'object' ? JSON.stringify(key) : key);
    }

    has(key: T): boolean {
        return super.has(typeof key === 'object' ? JSON.stringify(key) : key);
    }
}

export function xgcd(a: number, b: number): number[] {
    let [r1, r2] = [a, b];
    let [s1, s2] = [1, 0];
    let [t1, t2] = [0, 1];

    let q: number;

    while (r2 !== 0) {
        q = Math.floor(r1 / r2);
        [r1, r2] = [r2, r1 - q * r2];
        [s1, s2] = [s2, s1 - q * s2];
        [t1, t2] = [t2, t1 - q * t2];
    }

    return [r1, s1, t1];
}

export function lcm(a: number, b: number): number {
    return a * b / xgcd(a, b)[0];
}
