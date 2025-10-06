function mergeSort(arr) {
    if (arr.length == 1) {
        return arr;
    }

    let start = 0;
    let end = arr.length;
    let middle = Math.floor((start + end) / 2);

    let left = mergeSort(arr.slice(start, middle));
    let right = mergeSort(arr.slice(middle, end));
    let sorted = merge(left, right);

    return sorted;
}

function merge(arr1, arr2) {
    let merged = [];

    let k = 0;
    let j = 0;

    for (let i = 0; i < arr1.length + arr2.length; i++) {
        if (k == arr1.length) {

            merged.push(...arr2.slice(j));
            break;
        }

        if (j == arr2.length) {
            merged.push(...arr1.slice(k));
            break;
        }

        merged[i] = arr1[k] > arr2[j] ? arr2[j++] : arr1[k++];
    }

    return merged;
}

console.log(mergeSort([105, 79, 100, 110]));