type Data = {
    vendedor: string[],
    comprador: string[],
    contato: string[],
    peso: number[]
}
function getData(sheet = getProp("currentRaffleSheet")) {
    let data = SpreadsheetApp.getActive().getSheetByName(sheet)?.getRange("A2:F")?.getValues()
    if (!data) throw new Error("failed to get data!")
    console.log(`getting data from sheet: ${sheet}`)

    let res: Data = {
        vendedor: [], comprador: [], contato: [], peso: []
    }

    for (const idx in data) {
        if (!data[idx][3]) { continue } // ignore empty rows
        res.vendedor.push(data[idx][1])
        res.comprador.push(data[idx][2])
        res.contato.push(data[idx][3])
        res.peso.push(Number(data[idx][4]))
    }

    if (res.vendedor.length != res.peso.length) throw "length problem!"
    return res
}