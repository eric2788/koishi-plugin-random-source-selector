import { Context, Fragment, Session } from "koishi";
import { SendType } from "./config";
import { getRandom } from "./utils";

interface SendMechanic {
    can_send: (s: string) => boolean
    to_jsx: (s: string) => Fragment
}


const sendMap: { [key in SendType]: SendMechanic } = {
    'text': {
        can_send: (s: string) => s.length > 0,
        to_jsx: (s: string) => s
    },

    'image': {
        can_send: (s: string) => s.startsWith('http') || s.startsWith('data:image/'),
        to_jsx: (s: string) => <image url={s} />
    }
}


export async function sendSource(session: Session<never, never, Context>, type: SendType, source: string[]) {
    try {
        const sendMechanic = sendMap[type]
        if (!sendMechanic) {
            await session.send(`不支持的发送类型: ${type}`)
            return
        }
        const filtered = source.filter(sendMechanic.can_send)
        console.info(`源数据量: ${source.length}, 发送数据量: ${filtered.length}`)
        const selected = getRandom(filtered)
        if (selected && selected.length > 0) {
            await session.send(sendMechanic.to_jsx(selected))
        } else {
            await session.send('没有符合条件的结果')
        }
    }catch(err){
        console.error(err)
        await session.send(`发送失败: ${err?.message ?? err}`)
    }
}