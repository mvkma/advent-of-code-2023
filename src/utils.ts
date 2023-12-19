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