function getProp(prop: string): string {
    const props = PropertiesService.getScriptProperties().getProperties()
    if (prop in props) { return props[prop] }
    throw new Error(`failed to find property ${prop}!`)
}
