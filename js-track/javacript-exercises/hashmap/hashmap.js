import LinkedList from "../linked-list/linked-list.js";

export default class HashMap {
    constructor() {
        this.capacity = 16;
        this.loadFactor = 0.75;
        this.buckets = new Array(this.capacity).fill(null);
        this.compareFn = (a, b) => a.key === b.key;
    }

    hash(key) {
        let hash = 0;
        for (let i = 0, len = key.length; i < len; i++) {
            let chr = key.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0;
        }
        return hash;
    }

    getIndex(key) {
        return Math.abs(this.hash(key)) % this.capacity;
    }

    set(key, value) {
        this._setNoResize(key, value);
        this.resize();
    }

    resize() {
        let count = this.length();

        if (count <= this.capacity * this.loadFactor) {
            return;
        }

        while (count > this.capacity * this.loadFactor) {
            this.capacity *= 2;
        }

        const oldBuckets = this.buckets;
        this.clear();

        for (const bucket of oldBuckets) {
            if (!bucket) {
                continue;
            }

            for (const item of bucket) {
                this._setNoResize(item.key, item.value);
            }
        }
    }

    _setNoResize(key, value) {
        const index = this.getIndex(key);
        this.buckets[index] = this.buckets[index] || new LinkedList();
        this.buckets[index].replaceOrAppend({ key, value }, this.compareFn);
    }

    get(key) {
        let item = this.getItemByKey(key);
        return item ? item.value : null;
    }

    has(key) {
        let item = this.getItemByKey(key);

        return item ? true : false;
    }

    getItemByKey(key) {
        let bucket = this.buckets[this.getIndex(key)];
        if (!bucket) {
            return null;
        }

        return bucket.find({ key }, this.compareFn) || null;
    }

    remove(key) {
        let bucket = this.buckets[this.getIndex(key)];

        if (!bucket) {
            return false;
        }

        let index = bucket.findIndex({ key }, this.compareFn);
        return bucket.removeAt(index) !== -1;
    }

    length() {
        return this.buckets.reduce((acc, bucket) => {
            if (!bucket) {
                return acc;
            }

            return acc + bucket.size;
        }, 0);
    }

    clear() {
        this.buckets = new Array(this.capacity).fill(null);
    }

    entries() {
        return this.buckets
            .filter(bucket => bucket)
            .map(bucket => [...bucket].map(node => [node.key, node.value]))
            .flat();
    }

    keys() {
        return this.entries().map(([key, _]) => key);
    }

    values() {
        return this.entries().map(([_, value]) => value);
    }
}