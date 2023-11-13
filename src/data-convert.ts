import { AxiosResponse } from "axios"
import { SplitType } from "./config"
import { logger } from "./logger"


const convertMap: { [key in SplitType | string]: (res: AxiosResponse) => any } = {
    'resource': (res: AxiosResponse) => res.request.res.responseUrl, 
    'image': (res: AxiosResponse) => {
        // logger warn it deprecated and use resource instead
        logger.warn('返回数据类型为 图片 已经被废弃，请使用 重定向链接')
        return res.request.res.responseUrl
    }
}

export function parseData<A, B>(res: AxiosResponse<A, B>, type: SplitType): any {
    const parser = convertMap[type]
    if (!parser) {
        return res.data
    }
    return parser(res)
}