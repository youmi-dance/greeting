const cloud = require('wx-server-sdk')
const dayjs = require('dayjs')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const userInfoCollection = db.collection('user_info')

exports.main = async (event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()

  // 查询用户信息是否已经存在
  const { data: [ userInfo] } = { data: [] } = await userInfoCollection.where({
    open_id: wxContext.OPENID
  }).get();

  /**
   * 如果用户第一次登录则入库用户信息；如果非首次登录则更新该用户的最新登录时间
   */
  if (!userInfo) {
    // 如果第一次登录，则插入数据到数据库
    try {
      const newTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const {
        APPID,
        ENV,
        OPENID,
        SOURCE,
        UNIONID,
        CLIENTIP,
        CLIENTIPV6,
        ...rest
      } = wxContext
      const rt = await userInfoCollection.add({
        data: {
          open_id: OPENID,
          app_id: APPID,
          source: SOURCE,
          env: ENV,
          client_ip: CLIENTIP,
          client_ip_v6: CLIENTIPV6,
          gmt_create: newTime,
          last_login_time: newTime,
          ...rest
        },
      });

      return {
        success: true,
        data: rt,
      }
    } catch (err) {
      console.error('user-info insert error', err)
      return {
        success: false,
        error: err,
      }
    }
  } else {
    // 当前不是第一次登录，数据库已经有信息，则更新数据
    try {
      const newTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const rt = await userInfoCollection.doc(userInfo._id).update({
        data: {
          last_login_time: newTime,
        }
      });

      return {
        success: true,
        data: rt,
      }
    } catch (err) {
      console.error('user-info update error', err)
      return {
        success: false,
        error: err,
      }
    }
  }

}

