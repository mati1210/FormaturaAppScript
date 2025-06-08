function getProp(prop: string): string {
    if (prop in props) { return props[prop] }
    throw new Error(`failed to find property ${prop}!`)
}
