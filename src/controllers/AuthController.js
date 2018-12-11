import passport from 'passport'
import BaseController from 'controllers/BaseController'
import { getToken } from 'utils/JWT'

export default class AuthController extends BaseController {
  constructor (router, { UserLog }) {
    super()

    this.router = router
    this.router.get('/auth/facebook', this.passportAuth('facebook', { scope: 'email' }))
    this.router.get('/auth/facebook/callback', this.passportAuthCallback('facebook'))
    this.router.get('/auth/google', this.passportAuth('google', { scope: ['openid', 'email'] }))
    this.router.get('/auth/google/callback', this.passportAuthCallback('google'))
    this.router.get('/auth/naver', this.passportAuth('naver'))
    this.router.get('/auth/naver/callback', this.passportAuthCallback('naver'))
    this.router.get('/auth/kakao', this.passportAuth('kakao'))
    this.router.get('/auth/kakao/callback', this.passportAuthCallback('kakao'))
    this.router.post('/auth/signout', this.signout)

    this.userLogModel = UserLog
  }

  setCookieForAuth = (req, res) => {
    const { provider, redirectUrl } = req.query
    const cookieOptions = {
      expires: new Date(Date.now() + 300000), // 5min (5 * 60 * 1000)
      httpOnly: false,
    }

    if (redirectUrl) {
      res.cookie('redirectUrl', redirectUrl, cookieOptions)
    }
    if (!provider) {
      this.sendResponseError(res, this.responseCodes.HTTP_403) // Forbidden
    }
  }

  signout = (req, res) => {
    const { userId, provider } = req.body

    if (userId && provider) {
      // 로그아웃 기록 저장
      this.userLogModel.findOne({ userId, provider })
        .then((resultData) => {
          const date = new Date()

          if (resultData) {
            // signin 기록이 없을 수 없다고 가정하고 update 처리만 한다.
            return this.userLogModel.update({ userId, provider }, { $push: { signoutLogs: date } })
          } else {
            throw new Error('No user log info to write signed-out time.')
          }
        })
        .then((resultData) => this.sendResponse(res, resultData))
        .catch((err) => this.logWarn(err)) // 실패 오류 및 후속 처리는 아무것도 없음
    } else {
      this.sendResponse(res, {})
    }
  }

  passportAuth = (provider, option) => (req, res, next) => {
    this.setCookieForAuth(req, res)
    passport.authenticate(provider, option, null)(req, res, next)
  }

  passportAuthCallback = (provider) => (req, res, next) => {
    (
      passport.authenticate(provider, (err, user/*, info*/) => {
        const redirectUrl = (req.cookies && req.cookies.redirectUrl) || ''
        const origin = process.env.URL_ORIGIN_UI

        res.clearCookie('redirectUrl') // always clear cookie

        if (err) {
          res.render('auth-response', {
            isSuccess: false,
            redirectUrl,
            payload: `${err.name}: ${err.message}`,
            origin,
          })
        } else {
          // 성공시 JWT 토큰 발급하여 전달
          const jwtPayload = {
            uid: user.userId,
            pro: user.provider,
            dsp: user.userName,
            rol: user.role,
            grp: user.group,
          }
          const jwtSecret = req.app.get('jwt-secret')

          getToken(jwtPayload, jwtSecret)
            .then((token) =>
              res.render('auth-response', {
                isSuccess: true,
                redirectUrl,
                payload: token,
                origin,
              }))
        }
      }, null)
    )(req, res, next)
  }
}
