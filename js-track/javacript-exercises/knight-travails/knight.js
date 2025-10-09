function knightMoves(start, end) {
    if (!isValidPosition(start) || !isValidPosition(end)) {
        return "Invalid positions";
    }

    let queue = [];
    let visited = new Set();
    let curr = start;

    queue.push({ pos: curr, path: [curr] });
    visited.add(start.toString());
    while (queue.length > 0) {
        curr = queue.shift();

        let currX = curr.pos[0];
        let currY = curr.pos[1];

        if (currX === end[0] && currY === end[1]) {
            return curr.path;
        }

        let possiblePositions = getPossiblePositions(currX, currY);

        possiblePositions.forEach(pos => {
            if (isValidPosition(pos) && !visited.has(pos.toString())) {
                visited.add(pos.toString());
                queue.push({ pos, path: [...curr.path, pos] });
            }
        });
    }
}

function getPossiblePositions(currX, currY) {
    return [
        [currX + 1, currY - 2],
        [currX + 2, currY - 1],
        [currX - 1, currY - 2],
        [currX - 2, currY - 1],

        [currX + 1, currY + 2],
        [currX + 2, currY + 1],
        [currX - 1, currY + 2],
        [currX - 2, currY + 1],
    ];
}

function isValidPosition([x, y]) {
    if (x < 0 || x > 7 || y < 0 || y > 7) {
        return false;
    }

    return true;
}

console.log(JSON.stringify(knightMoves([0, 0], [1, 7])));