import { Get } from 'cosmokit'
import { Splits, SplitType } from "./config"
import { logger } from "./logger"
import { AxiosResponse } from "axios";


const convertMap = {
  'resource': (res: AxiosResponse) => res.request.responseURL,
  'image': (res: AxiosResponse) => {
    // logger warn it deprecated and use resource instead
    logger.warn('返回数据类型为 图片 已经被废弃，请使用 资源')
    return res.request.responseURL
  }
} satisfies { [K in SplitType | string]: any }

export function parseData<T extends SplitType>(res: Splits[T] extends (res: infer T) => any ? AxiosResponse<T> : any, type: T | string): any {
  const parser = convertMap[type as keyof typeof convertMap]
  if (!parser) return res.data
  return parser(res)
}
