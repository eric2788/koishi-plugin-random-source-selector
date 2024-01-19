import { Dict, Schema } from 'koishi'
import { Quester } from 'cordis-axios'

export type SendType = 'image' | 'text' | 'ejs' | 'audio' | 'video' | 'file'

// 'image' is deprecated, use resource instead
export interface Splits {
  resource(res: string): string[]

  // @deprecated, use `resource` instead
  image(res: string): string[]

  json(res: any): object

  html(res: string, options?: any): string[]

  plain(res: string): string[]

  txt(res: string): string[]
}

export type SplitType = keyof Splits
export type RequestMethod = Quester.Method

export interface RandomSource {
  command: string
  alias: string[]
  source_url: string
  request_method: RequestMethod
  request_headers: Dict<string, string>,
  request_data: string,
  request_json: boolean,
  send_type: SendType
  data_type: SplitType
  recall?: number

  json_key?: string
  jquery_selector?: string
  attribute?: string,
  ejs_template?: string
}

const option_keys: string[] = [
  'json_key',
  'jquery_selector',
  'attribute',
  'ejs_template'
]

export interface Config {
  sources: RandomSource[]
}


export const Config: Schema = Schema.object({
  sources: Schema.array(Schema.intersect([Schema.object({
    command: Schema.string().description('指令名称').required(),
    alias: Schema.array(Schema.string()).description('指令别名').default([]),
    source_url: Schema.string().description('数据源地址').required(),
    request_method: Schema.union(['GET', 'POST', 'PUT', 'DELETE']).description('请求方法').default('GET'),
    request_headers: Schema.dict(String).role('table').description('请求头').default({}),
    request_data: Schema.string().role('textarea').description('请求数据').default(''),
    request_json: Schema.boolean().description('请求数据是否为 JSON').default(false),
    recall: Schema.number().description('消息撤回时限(分钟,0为不撤回)').default(0),
    send_type: Schema.union([
      Schema.const('image').description('图片'),
      Schema.const('text').description('文本'),
      Schema.const('ejs').description('EJS 模板'),
      Schema.const('audio').description('音频'),
      Schema.const('video').description('视频'),
      Schema.const('file').description('文件')
    ]).description('发送类型').default('text'),
    data_type: Schema.union([
      Schema.const('json').description('JSON'),
      Schema.const('txt').description('多行文本'),
      Schema.const('image').description('图片').deprecated(),
      Schema.const('resource').description('资源 (图片/视频/音频等)'),
      Schema.const('html').description('HTML 文本'),
      Schema.const('plain').description('元数据, 供EJS模板使用')
    ]).description('数据返回类型').default('txt'),
  }),
    Schema.union([
      Schema.object({
        data_type: Schema.const('json').required(),
        json_key: Schema.string().description('使用JS代码进行嵌套取值, 支援使用[]代表迭代元素')
      }).description('数据返回类型 - 额外配置'),
      Schema.object({
        data_type: Schema.const('html').required(),
        jquery_selector: Schema.string().description('jQuery 选择器').default('p'),
        attribute: Schema.string().description('要提取的 HTML 元素属性, 数值为空时获取HTML元素内文字').default('')
      }).description('数据返回类型 - 额外配置'),
      Schema.object({
        send_type: Schema.const('ejs').required(),
        ejs_template: Schema.string().role('textarea', { rows: [4, 10] }).description('EJS 模板').required(),
      }).description('发送类型 - 额外配置'),
      Schema.object({} as any)
    ])
  ])),
})


export function extractOptions(source: RandomSource): object {
  const options: any = {}
  option_keys.forEach(key => {
    if (source[key]) {
      options[key] = source[key]
    }
  })
  return options
}
