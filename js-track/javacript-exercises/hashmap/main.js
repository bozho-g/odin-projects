import HashMap from "./hashmap.js";
import HashSet from "./hashset.js";

const test = new HashSet();

test.set('apple');

console.log(test.has('apple'));

console.log(test.keys());

test.set('apple', 'red');
test.set('banana', 'yellow');
test.set('carrot', 'orange');
test.set('dog', 'brown');
test.set('elephant', 'gray');
test.set('frog', 'green');
test.set('grape', 'purple');
test.set('hat', 'black');
test.set('ice cream', 'white');
test.set('jacket', 'blue');
test.set('kite', 'pink');
test.set('lion', 'golden');

test.set('moon', 'silver');

console.log(test.has('moon'));


console.log(test.keys());
test.clear();
