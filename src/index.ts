import { Context, Session, Command } from 'koishi'
import { Config, RandomSource } from './config'
import axios, { AxiosResponse } from 'axios'
import { parseSource } from './split'
import { clearRecalls, sendSource } from './send'

export { Config } from './config'
export const name = 'random-source-selector'
export const usage = `透过扫描API链接返回的数据随机抽出一条作为图片或文案发送，支援自定义指令`

export function apply(ctx: Context, config: Config) {
  // write your plugin here
  config.sources.forEach(source => {
    ctx.command(source.command, '随机抽出该链接中的一条作为图片或文案发送', cmdConfig)
      .alias(...source.alias)
      .action(({ session }) => sendFromSource(session, source))
  })

  ctx.on('dispose', () => clearRecalls())
}

async function sendFromSource(session: Session<never, never, Context>, source: RandomSource) {
  try {
    await session.send(`获取 ${source.command} 中，请稍候...`)
    const res: AxiosResponse = await axios.get(source.source_url)
    if (res.status !== 200) {
      const msg = JSON.stringify(res.data)
      throw new Error(`${msg} (${res.statusText})`)
    }
    const elements = parseSource(res, source.data_type, {
      json_key: source.json_key,
      jquery_selector: source.jquery_selector,
      attribute: source.attribute
    })
    await sendSource(session, source.send_type, elements, source.recall)

  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(err.code, err.stack)
      await session.send(`发送失败: ${err.message}`)
    } else {
      console.error(err)
      await session.send(`发送失败: ${err?.message ?? err}`)
    }
  }
}


const cmdConfig: Command.Config = {
  checkArgCount: true,
  checkUnknown: true,
  handleError: (err, { session, command }) => {
    console.error(err)
    session.send(`执行指令 ${command.displayName} 时出现错误: ${err.message ?? err}`)
  }
}