import LinkedList from "../linked-list/linked-list.js";

export default class HashSet {
    constructor() {
        this.capacity = 16;
        this.loadFactor = 0.75;
        this.buckets = new Array(this.capacity).fill(null);
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

    set(key) {
        this._setNoResize(key);
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

            for (const key of bucket) {
                this._setNoResize(key);
            }
        }
    }

    _setNoResize(key) {
        const index = this.getIndex(key);
        this.buckets[index] = this.buckets[index] || new LinkedList();
        this.buckets[index].replaceOrAppend(key);
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

        return bucket.find(key) || null;
    }

    remove(key) {
        let bucket = this.buckets[this.getIndex(key)];

        if (!bucket) {
            return false;
        }

        let index = bucket.findIndex(key);
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

    keys() {
        return this.buckets
            .filter(bucket => bucket)
            .flatMap(bucket => [...bucket]);
    }
}