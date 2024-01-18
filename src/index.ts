import { Context, Session, Command, Logger } from 'koishi'
import { Config, RandomSource, extractOptions } from './config'
import { SourceResult } from './shared'
import { parseSource } from './split'
import { clearRecalls, sendSource } from './send'
import { format } from './utils' 
import { logger } from './logger'

export { Config } from './config'
export const name = 'random-source-selector'
export const usage = `用法请详阅 readme.md`


export function apply(ctx: Context, config: Config) {
  // write your plugin here
  const commands = []
  config.sources.forEach(source => commands.push(
      ctx.command(`${source.command} [...args]`, '随机抽出该链接中的一条作为图片或文案发送', cmdConfig)
      .option('data', '-D [data:text] 请求数据')
      .alias(...source.alias)
      .action(({ session, options }, ...args) => sendFromSource(session, source, args, options.data))
  ))
  ctx.accept(config => {
    commands.forEach(command=>command.dispose())
    config.sources.forEach(source => commands.push(
      ctx.command(`${source.command} [...args]`, '随机抽出该链接中的一条作为图片或文案发送', cmdConfig)
      .option('data', '-D [data:text] 请求数据')
      .alias(...source.alias)
      .action(({ session, options }, ...args) => sendFromSource(session, source, args, options.data))
    ))
  })

  ctx.on('dispose', () => clearRecalls())
}

async function sendFromSource(session: Session<never, never, Context>, source: RandomSource, args: string[] = [], data?: string) {
  try {
    const options = extractOptions(source)
    logger.debug('options: ', options)
    logger.debug('args: ', args)
    logger.debug('data: ', data)
    await session.send(`获取 ${source.command} 中，请稍候...`)
    const requestData = data ?? source.request_data
    const data: SourceResult = await ctx.http[source.request_method.toLowerCase()]({
      method: source.request_method,
      url: format(source.source_url, ...args),
      headers: source.request_headers,
      data: source.request_json ? JSON.parse(requestData) : requestData
    })
    const elements = parseSource(data, source.data_type, options)
    await sendSource(session, source.send_type, elements, source.recall, options)

  } catch (e) {
    if (e.isAxiosError) {
      logger.warn(e)
      await session.send(`发送失败: ${err.message}`)
    }
    throw e
  }
}

const cmdConfig: Command.Config = {
  checkArgCount: true,
  checkUnknown: true,
  handleError: (err, { session, command }) => {
    logger.warn(err)
    session.send(`执行指令 ${command.displayName} 时出现错误: ${err.message ?? err}`)
  }
}
