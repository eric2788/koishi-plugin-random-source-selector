import { SplitType } from "./config"
import { logger } from "./logger"


const convertMap: { [key in SplitType | string]: (res: AxiosResponse) => any } = {
    'resource': (res: any) => res, 
    'image': (res: any) => {
        // logger warn it deprecated and use resource instead
        logger.warn('返回数据类型为 图片 已经被废弃，请使用 资源')
        return res
    }
}

export function parseData<A, B>(res: AxiosResponse<A, B>, type: SplitType): any {
    const parser = convertMap[type]
    if (!parser) return res
    return parser(res)
}
