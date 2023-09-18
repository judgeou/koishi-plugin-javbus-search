import { Context, Schema, h } from 'koishi'
import { hText, getJSONHttp, downloadHttp } from './helper'
import { SocksProxyAgent } from 'socks-proxy-agent'

export const name = 'javbus-search'

export interface Config {
  显示数量: number,
  磁链显示数量: number,
  是否显示显示磁链协议头: boolean,
  是否显示封面: boolean,
  封面下载代理Socks: string
}

export const Config: Schema<Config> = Schema.object({
  显示数量: Schema.number(),
  磁链显示数量: Schema.number(),
  是否显示显示磁链协议头: Schema.boolean(),
  是否显示封面: Schema.boolean(),
  封面下载代理Socks: Schema.string()
})

export function apply(ctx: Context, config: Config) {

  // write your plugin here
  ctx.command('搜索艾薇 <keyword>').action(async ({ args }, keyword) => {
    if (!keyword) {
      return ''
    }
    const keyword_param = encodeURIComponent(keyword)
    const result = await getJSONHttp(`https://javbus.onrender.com/api/v1/movies/search?keyword=${keyword_param}&page=1&magnet=exist`, true)

    if (result && result.movies && result.movies.length) {
      const movies = result.movies.slice(0, config.显示数量 || 3)
      const rows = movies.map((item, i) => {
        return hText(`${item.id} ${item.title}\n\n`)
      })

      return rows
    } else {
      return `${keyword} 啥也没有`
    }
  })

  ctx.command('艾薇详情 <id>').action(async ({args}, id) => {
    if (!id) {
      return ''
    }
    const detail = await getJSONHttp(`https://javbus.onrender.com/api/v1/movies/${encodeURIComponent(id)}`, true)
    const { magnets, img } = detail
    const magnets_text = magnets.slice(0, config.磁链显示数量 || 3)
      .map(item => `${item.size} ${config.是否显示显示磁链协议头 ? item.link : item.id}`).join('\n')

    let cover = hText('')
    if (config.是否显示封面) {
      const agent = config.封面下载代理Socks ? new SocksProxyAgent(config.封面下载代理Socks) : null
      const { buffer, mime } = await downloadHttp(img, true, agent)

      cover = h.image(buffer, mime)
    }

    return [
      hText(`${detail.title}\n\n${detail.stars[0].name}\n\n${detail.publisher.name}\n\n`),
      cover,
      hText(magnets_text)
    ]
  })
}
