export function parseObjectToArr(data: any): any[] {
    const elements: any[] = []
    if (Array.isArray(data)) {
        for (const item of data) {
            elements.push(...parseObjectToArr(item))
        }
    } else if (data instanceof Object) {
        for (const key in data) {
            elements.push(...parseObjectToArr(data[key]))
        }
    } else {
        elements.push(data)
    }
    return elements
}



export function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}