const global = globalThis as typeof globalThis & { reloadCache: Record<string, any> };
if (global.reloadCache === undefined) {
    global.reloadCache = {};
}

export function reloadable<T extends { new (...args: any[]): {} }>(constructor: T): T {
    const className = constructor.name;
    if (global.reloadCache[className] === undefined) {
        global.reloadCache[className] = constructor;
    }

    Object.assign(global.reloadCache[className].prototype, constructor.prototype);
    return global.reloadCache[className];
}

/**
 * Turn a table object into an array.
 * @param obj The object to transform to an array.
 * @returns An array with items of the value type of the original object.
 */
export function toArray<T>(obj: Record<number, T>): T[] {
    print("ToArray");
    DeepPrintTable(obj);
    let result: T[] = [];
    for (let [k,v] of Object.entries(obj)) {
        result[tonumber(k)! - 1] = v;
    }
    DeepPrintTable(result);
    return result;
}