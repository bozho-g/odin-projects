import Tree from "./bst.js";

const prettyPrint = (node, prefix = '', isLeft = true) => {
    if (node === null) {
        return;
    }
    if (node.right !== null) {
        prettyPrint(node.right, `${prefix}${isLeft ? '│   ' : '    '}`, false);
    }
    console.log(`${prefix}${isLeft ? '└── ' : '┌── '}${node.data}`);
    if (node.left !== null) {
        prettyPrint(node.left, `${prefix}${isLeft ? '    ' : '│   '}`, true);
    }
};

const arrayOfRandomNumbers = (size, maxNum) => {
    let arr = [];

    for (let i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * maxNum);
    }

    return arr;
};

const arr = arrayOfRandomNumbers(10, 100);
const test = new Tree(arr);

function printAllOrders(tree) {
    let printArr = [];
    console.log("Level Order:");
    tree.levelOrderForEach((x) => printArr.push(x.data));
    console.log(printArr.join(' '));

    console.log("In Order:");
    printArr = [];
    tree.inOrderForEach((x) => printArr.push(x.data));
    console.log(printArr.join(' '));

    console.log("Pre Order:");
    printArr = [];
    tree.preOrderForEach((x) => printArr.push(x.data));
    console.log(printArr.join(' '));

    console.log("Post Order:");
    printArr = [];
    tree.postOrderForEach((x) => printArr.push(x.data));
    console.log(printArr.join(' '));
}

printAllOrders(test);

prettyPrint(test.root);

console.log(`Is Balanced before isertion: ${test.isBalanced()}`);

test.insert(101);
test.insert(102);
test.insert(103);
test.insert(104);

prettyPrint(test.root);

console.log(`Is Balanced after insertion: ${test.isBalanced()}`);

test.rebalance();

prettyPrint(test.root);
console.log(`Is Balanced after rebalance: ${test.isBalanced()}`);

printAllOrders(test);