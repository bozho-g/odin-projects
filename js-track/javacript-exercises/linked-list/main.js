import LinkedList from "./linked-list.js";

const list = new LinkedList();

console.log(list.removeAt(0));
list.prepend("dog PREP");
console.log(list.removeAt(0));
list.append("dog");
list.append("cat");

console.log(list.removeAt(2));
console.log(list.removeAt(1));
console.log(list.toString());


console.log(list.insertAt(0, 0));
console.log(list.insertAt(0, "prepend"));
console.log(list.insertAt(2, "append"));
console.log(list.insertAt(1, -1));
console.log(list.insertAt(1.5, 1.5));

list.prepend("dog PREP");

list.append("dog");
console.log(list.pop());
console.log(list.toString());

list.append("cat");
console.log(list.toString());

list.append(1);
console.log(list.toString());
list.append(2);
console.log(list.toString());
list.append(3);
list.prepend("cat");
console.log(list.toString());

list.append("parrot");

list.append("hamster");
list.append("snake");
list.append("turtle");


// console.log(list.size);
// console.log(list.head);
// console.log(list.tail);

// console.log(list.find("turtle"));

console.log(list.toString());

console.log(list.pop());
console.log(list.pop());

console.log(list.toString());
