export async function delay(delayMS: number) {
    await new Promise((res) => setTimeout(res, delayMS))
}

export function arrayToMap<TDataOut, TKey, TDataIn>(
    array: TDataIn[],
    mapFn: (element: TDataIn) => TDataOut,
    keyMapFn: (element: TDataIn) => TKey
): Map<TKey, TDataOut> {
    return array.reduce(
        (map, element) => map.set(keyMapFn(element), mapFn(element)),
        new Map<TKey, TDataOut>()
    )
}
