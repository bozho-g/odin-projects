export default class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    append(value) {
        let newNode = new Node(value);

        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = this.tail.next;
        }

        this.size++;
    }

    prepend(value) {
        if (this.size === 0) {
            this.append(value);
            return;
        }

        this.size++;
        let newNode = new Node(value);

        newNode.next = this.head;
        this.head = newNode;
    }

    at(index) {
        if (index < 0 || index >= this.size) {
            return -1;
        }

        let curr = this.head;
        for (let i = 0; i < index; i++) {
            curr = curr.next;
        }

        return curr;
    }

    pop() {
        if (this.size === 0) {
            return -1;
        }

        if (this.size === 1) {
            let value = this.head.value;
            this.tail = null;
            this.head = null;
            this.size = 0;
            return value;
        }

        let previous = this.at(this.size - 2);
        let removed = previous.next;

        previous.next = null;
        this.tail = previous;
        this.size--;
        return removed.value;
    }

    contains(value) {
        let curr = this.head;

        while (curr) {
            if (curr.value === value) {
                return true;
            }

            curr = curr.next;
        }

        return false;
    }

    find(value) {
        let curr = this.head;
        let i = 0;
        while (curr) {
            if (curr.value === value) {
                return i;
            }

            curr = curr.next;
            i++;
        }

        return -1;
    }

    *[Symbol.iterator]() {
        let curr = this.head;

        while (curr) {
            yield curr.value;
            curr = curr.next;
        }
    };

    toString() {
        let arr = [...this];
        let str = "";

        for (let i = 0; i < this.size; i++) {
            str += `(${arr[i]}) -> `;
        }

        str += "null";

        return str;
    }

    insertAt(index, value) {
        if (!Number.isInteger(index) || index < 0 || index > this.size) {
            return -1;
        }

        if (index === 0) {
            this.prepend(value);
            return;
        }

        if (index === this.size) {
            this.append(value);
            return;
        }

        let prev = this.at(index - 1);
        if (prev === -1) {
            return prev;
        }

        let curr = prev.next;
        let newNode = new Node(value);
        prev.next = newNode;
        newNode.next = curr;

        this.size++;
        return newNode;
    }

    removeAt(index) {
        if (!Number.isInteger(index) || index < 0 || index >= this.size) {
            return -1;
        }

        if (index === 0) {
            let removed = this.head.value;
            this.head = this.head.next;
            this.size--;

            if (this.size === 0) {
                this.tail = null;
            }

            return removed;
        }

        let prev = this.at(index - 1);
        let removed = prev.next;

        prev.next = removed.next;
        if (removed === this.tail) {
            this.tail = prev;
        }

        this.size--;
        return removed.value;
    }
}

class Node {
    constructor(value = null, next = null) {
        this.value = value;
        this.next = next;
    }
}
