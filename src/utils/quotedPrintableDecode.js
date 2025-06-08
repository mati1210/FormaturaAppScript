// SPDX-License-Identifier: MPL-2.0

function quotedPrintableDecode(str: string): string {
    return str.replace(/(=[A-Z0-9]{2})+/g, char => {
        let bytearr = new Uint8Array(char.slice(1).split('=').map(b => Number.parseInt(b, 16)));
        let decoder = new TextDecoder('utf8');
        return decoder.decode(bytearr);
    });
}
