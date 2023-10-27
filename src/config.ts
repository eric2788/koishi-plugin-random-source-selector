import { Schema } from 'koishi'

export type SendType = 'image' | 'text'

export type SplitType = 'json' | 'txt' | 'image' | 'html'

export interface RandomSource {
    command: string
    alias: string[]
    source_url: string
    send_type: SendType
    data_type: SplitType

    json_key?: string
    jquery_selector?: string
    attribute?: string
}

export interface Config {
    sources: RandomSource[]
}


export const Config: Schema<Config> = Schema.object({
    sources: Schema.array(Schema.intersect([
        Schema.object({
            command: Schema.string().description('指令名称').required(),
            alias: Schema.array(Schema.string()).description('指令别名').default([]),
            source_url: Schema.string().description('数据源地址').required(),
            send_type: Schema.union([
                Schema.const('image').description('图片'),
                Schema.const('text').description('文本')
            ]).description('发送类型').default('text'),
            data_type: Schema.union([
                Schema.const('json').description('JSON'),
                Schema.const('txt').description('多行文本'),
                Schema.const('image').description('图片'),
                Schema.const('html').description('HTML 文本')
            ]).description('数据返回类型').default('txt'),
        }),
        Schema.union([
            Schema.object({
                data_type: Schema.const('json').required(),
                json_key: Schema.string().description('JSON array 的 key, 支援使用 `.` 进行多层嵌套')
            }).description('返回数据为 JSON Object 时使用'),
            Schema.object({
                data_type: Schema.const('html').required(),
                jquery_selector: Schema.string().description('jQuery 选择器').default('p'),
                attribute: Schema.string().description('要提取的 HTML 元素属性, 数值为空时获取HTML元素内文字').default('')
            }).description('返回数据为 HTML 时使用, 默认提取所有 `p` 元素内的文字'),
            Schema.object([])
        ])
    ])),
})


