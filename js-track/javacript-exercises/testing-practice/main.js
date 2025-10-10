function capitalize(string) {
    return String(string).charAt(0).toUpperCase() + String(string).slice(1);
}

function reverseString(string) {
    return string.split("").reverse().join("");
}

const calculator = {
    add: (a, b) => {
        return a + b;
    },
    subtract: (a, b) => {
        return a - b;
    },
    multiply: (a, b) => {
        return a * b;
    },
    divide: (a, b) => {
        return a / b;
    },
};

function ceasarCipher(string, shiftFactor) {
    let pattern = /[a-z]/i;
    let newStr = "";

    for (let i = 0; i < string.length; i++) {
        if (pattern.test(string.charAt(i))) {

            newStr += wrapChar(string[i], shiftFactor);
            continue;
        }

        newStr += string.charAt(i);
    }

    return newStr;
}

function wrapChar(char, shiftFactor) {
    let charCode = char.charCodeAt(0) + shiftFactor;
    if (char === char.toLowerCase()) {
        if (charCode > 122) {
            charCode -= 26;
        } else if (charCode < 97) {
            charCode += 26;
        }

        return String.fromCharCode(charCode);
    }

    if (charCode > 90) {
        charCode -= 26;
    } else if (charCode < 65) {
        charCode += 26;
    }

    return String.fromCharCode(charCode);
}

function analyzeArray(arr) {
    return {
        average: arr.reduce((acc, val) => acc + val, 0) / arr.length,
        min: arr.reduce((acc, val) => {
            return acc < val ? acc : val;
        }),
        max: arr.reduce((acc, val) => {
            return acc > val ? acc : val;
        }),
        length: arr.length
    };
}
let obj = analyzeArray([1, 2, 3, 4]);



export { capitalize, reverseString, calculator, ceasarCipher, analyzeArray };