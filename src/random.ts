// SPDX-License-Identifier: MPL-2.0
function weightedRandom(weights: number[]) {
    weights = weights.flat()
    let total = weights.reduce((sum, w) => sum += w, 0);

    const choice = Math.random() * total;

    let cursor = 0;
    for (let idx = 0; idx < weights.length; idx++) {
        cursor += weights[idx];
        if (cursor > choice) {
            return idx;
        }
    }

    return weights.length - 1
}

function getOne() {
    const data = getData()

    const idx = weightedRandom(data.peso)
    console.log(`${data.comprador[idx]} (${data.contato[idx]})`)
}

function testWeightedRandom(times = Math.pow(10, 6)) {
    const data = getData()
    let weightSum = data.peso.reduce((sum, w) => sum + w, 0);

    let counter: { [key: number]: number } = {};
    let before = Date.now() // 'performance' is not defined
    for (let i = 0; i < times; i++) {
        let key = weightedRandom(data.peso);
        if (key in counter) {
            counter[key] += 1;
        } else {
            counter[key] = 1;
        }
    }

    console.log(`samples: ${times.toLocaleString()} (took ${Date.now() - before}ms)`)
    for (let [idx, _] of Array.from(data.peso.entries()).sort((a, b) => a[1] - b[1])) {
        const name = data.comprador[idx];
        const weight = data.peso[idx];

        const count = counter[idx];
        const actualPercent = (count / times) * 100;
        const expectedPercent = (weight / weightSum) * 100;
        const deviation = Math.abs(actualPercent - expectedPercent);

        console.log(`${name}:\n ${count} (${actualPercent.toFixed(3)}%, expected ${weight}/${weightSum} ${expectedPercent.toFixed(3)}%, deviation: ${deviation.toFixed(3)}%)`)
    }
}