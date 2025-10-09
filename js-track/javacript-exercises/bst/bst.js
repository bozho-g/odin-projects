class Node {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

export default class Tree {
    constructor(arr) {
        let sorted = [...new Set(arr)].sort((a, b) => a - b);
        this.root = this.buildTree(sorted);
    }

    buildTree(arr) {
        if (arr.length === 0) {
            return null;
        }

        let middle = Math.floor(arr.length / 2);

        let root = new Node(arr[middle]);

        root.left = this.buildTree(arr.slice(0, middle));
        root.right = this.buildTree(arr.slice(middle + 1));
        return root;
    }

    insert(value) {
        this.root = this.#insertRec(this.root, value);
        // if (!this.isBalanced()) {
        //     this.rebalance();
        // }
    }

    #insertRec(root, value) {
        if (root === null) {
            return new Node(value);
        }

        if (root.data === value) {
            return root;
        }

        if (value < root.data) {
            root.left = this.#insertRec(root.left, value);
        } else {
            root.right = this.#insertRec(root.right, value);
        }

        return root;
    }

    delete(value) {
        this.root = this.#deleteRec(this.root, value);
        // if (!this.isBalanced()) {
        //     this.rebalance();
        // }
    }

    #deleteRec(root, value) {
        if (root === null) {
            return root;
        }

        if (value < root.data) {
            root.left = this.#deleteRec(root.left, value);
        } else if (value > root.data) {
            root.right = this.#deleteRec(root.right, value);
        } else {
            if (root.left === null && root.right === null) {
                return null;
            }

            if (root.right === null) {
                return root.left;
            }

            if (root.left === null) {
                return root.right;
            }

            let successorParent = root;
            let successor = root.right;
            while (successor.left !== null) {
                successorParent = successor;
                successor = successor.left;
            }

            root.data = successor.data;
            if (successorParent.left === successor) {
                successorParent.left = successor.right;
            } else {
                successorParent.right = successor.right;
            }
        }

        return root;
    }

    find(value) {
        let curr = this.root;

        while (curr) {
            if (curr.data === value) {
                return curr;
            }

            if (value < curr.data) {
                curr = curr.left;
            }
            else {
                curr = curr.right;
            }
        }

        return null;
    }

    levelOrderForEach(callback) {
        if (!callback) {
            throw new Error("No callback defined.");
        }

        if (this.root === null) {
            return;
        }

        let curr = this.root;
        let queue = [];

        queue.push(curr);

        while (queue.length > 0) {
            curr = queue.shift();

            if (curr.left !== null) {
                queue.push(curr.left);
            }

            if (curr.right !== null) {
                queue.push(curr.right);
            }

            callback(curr);
        }
    }

    inOrderForEach(callback) {
        if (!callback) {
            throw new Error("No callback defined.");
        }

        this.#inOrderForEachRec(this.root, callback);
    }

    preOrderForEach(callback) {
        if (!callback) {
            throw new Error("No callback defined.");
        }

        this.#preOrderForEachRec(this.root, callback);
    }

    postOrderForEach(callback) {
        if (!callback) {
            throw new Error("No callback defined.");
        }

        this.#postOrderForEachRec(this.root, callback);
    }

    #inOrderForEachRec(root, callback) {
        if (root === null) {
            return;
        }

        this.#inOrderForEachRec(root.left, callback);
        callback(root);
        this.#inOrderForEachRec(root.right, callback);
    }

    #preOrderForEachRec(root, callback) {
        if (root === null) {
            return;
        }

        callback(root);
        this.#preOrderForEachRec(root.left, callback);
        this.#preOrderForEachRec(root.right, callback);
    }

    #postOrderForEachRec(root, callback) {
        if (root === null) {
            return;
        }

        this.#postOrderForEachRec(root.left, callback);
        this.#postOrderForEachRec(root.right, callback);
        callback(root);
    }

    height(value) {
        let node = this.find(value);
        if (node === null) {
            return null;
        }

        const getHeight = (node) => {
            if (node === null) {
                return -1;
            }
            return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
        };

        return getHeight(node);
    };

    depth(value) {
        let curr = this.root;
        let depth = 0;

        while (curr) {
            if (curr.data === value) {
                return depth;
            }
            if (value < curr.data) {
                curr = curr.left;
            } else {
                curr = curr.right;
            }
            depth++;
        }

        return null;
    }

    isBalanced() {
        const getBalance = (node) => {
            if (node === null) {
                return 0;
            }

            const leftHeight = getBalance(node.left);
            if (leftHeight === -1) {
                return -1;
            }

            const rightHeight = getBalance(node.right);
            if (rightHeight === -1) {
                return -1;
            }

            if (Math.abs(leftHeight - rightHeight) > 1) {
                return -1;
            }

            return Math.max(leftHeight, rightHeight) + 1;
        };

        return getBalance(this.root) !== -1;
    }

    rebalance() {
        let arr = [];
        this.inOrderForEach(x => arr.push(x.data));

        this.root = this.buildTree(arr);
    }
}
