import { AxiosResponse } from "axios";
import { SplitType } from "./config";
import { parseObjectToArr } from "./utils";
import { parseData } from "./data-convert";
import { parse } from 'node-html-parser';


const splitMap: { [key in SplitType]: (data: any, options?: any) => string[] } = {
    json: (data: any, options?: any) => {
        if (typeof data === 'string') {
            console.debug('json data is string, try to parse it', data)
            data = JSON.parse(data.replace('<br>', '\\n'))
        }
        const key: string | undefined = options?.json_key
        let elements: any[]
        if (Array.isArray(data)) {
            elements = parseObjectToArr(data)
        } else {
            let target = data
            if (key) {
                const keys = key.split('.')
                for (const k of keys) {
                    target = target[k]
                }
            }
            elements = parseObjectToArr(target)
        }

        return elements
            .filter(s => typeof s === 'string')
            .map(s => s as string)
    },
    txt: (data: any) => {
        return (data as string).split('\n')
    },
    image: (data: any) => {
        // data-convert.ts 中已经处理了
        return [data]
    },
    html: (data: any, options?: any) => {
        const { jquery_selector: selector, attribute } = options
        const root = parse(data)
        return Array.from(root.querySelectorAll(selector ?? 'img')).map(e => e.getAttribute(attribute ?? 'src'))
    }
}

export function parseSource(res: AxiosResponse, type: SplitType, options?: any): string[] {
    const data = parseData(res, type)
    const parser = splitMap[type]
    if (!parser) {
        throw new Error(`未知的分隔类型: ${type}`)
    }
    const result = parser(data, options)
    console.debug(`${type} 的分隔结果: ${result}`)
    return result
}


