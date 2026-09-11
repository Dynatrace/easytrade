/**
 * Return a random element from array or undefined if array is empty
 * @param array
 * @returns
 */
export function arrayRandom<T>(array: T[]): T | undefined {
    if (array.length === 0) {
        return
    }
    return array[Math.floor(Math.random() * array.length)]
}
