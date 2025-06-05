// SPDX-License-Identifier: MPL-2.0

function weightedRandom(val: string[][], weights: number[]) {
    let data = val.map(v => v.join(' '))
    weights = weights.flat()
    if (data.length != weights.length || weights.length <= 0) {
        throw "length problem!";
    }

    let total = weights.reduce((sum, w) => sum += Number(w), 0);

    const choice = Math.random() * total;

    let cursor = 0;
    for (let idx = 0; idx < weights.length; idx++) {
        cursor += weights[idx];
        if (cursor > choice) {
            return idx;
        }
    }

    return data.length - 1
}

function testWeightedRandom(data: string[][], weights: number[], times = Math.pow(10, 5)) {
    let weightSum = weights.reduce((sum, w) => sum + Number(w), 0);

    let counter: { [key: number]: number } = {};
    for (let i = 0; i < times; i++) {
        let key = weightedRandom(data, weights);
        if (key in counter) {
            counter[key] += 1;
        } else {
            counter[key] = 1;
        }
    }

    let results = `Total samples: ${times.toLocaleString()}\n\n`;
    for (let [idx, _] of Array.from(weights.entries()).sort((a, b) => Number(a[1]) - Number(b[1]))) {
        const name = data[idx];
        const weight = weights[idx];

        const count = counter[idx];
        const actualPercent = (count / times) * 100;
        const expectedPercent = (weight / weightSum) * 100;
        const deviation = Math.abs(actualPercent - expectedPercent);

        results += `${name}:\n ${count} (${actualPercent.toFixed(3)}%, expected ${weight}/${weightSum} ${expectedPercent.toFixed(3)}%, deviation: ${deviation.toFixed(3)}%)\n\n`;
    }

    Logger.log(results);
    return results;
}