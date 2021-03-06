import passport from 'passport'
import BaseController from 'controllers/BaseController'
import { getToken } from 'utils/JWT'

const authProviders = ['facebook', 'google', 'kakao', 'naver']

export default class AuthController extends BaseController {
  constructor (router, { UserLog }) {
    super()

    this.router = router
    this.router.get('/auth/:provider', this.passportAuth)
    this.router.get('/auth/:provider/callback', this.passportAuthCallback)
    this.router.post('/auth/signout', this.signout)

    this.userLogModel = UserLog
  }

  passportAuth = (req, res, next) => {
    const { provider } = req.params
    if (provider && authProviders.indexOf(provider) >= 0) {
      const { redirectUrl } = req.query
      const cookieOptions = {
        expires: new Date(Date.now() + 300000), // 5min (5 * 60 * 1000)
        httpOnly: false,
      }

      if (redirectUrl) {
        res.cookie('redirectUrl', redirectUrl, cookieOptions)
      }

      let temp, option = null
      switch (provider) {
        case 'facebook': {
          temp = JSON.parse(process.env.PASSPORT_FACEBOOK_PROFILE_FIELDS)
          option = temp && temp.length ? { scope: temp.join(',') } : null
          break;
        }
        case 'google': {
          temp = JSON.parse(process.env.PASSPORT_GOOGLE_SCOPE)
          option = temp && temp.length ? { scope: temp } : null
          break;
        }
        default:
          break;
      }
      passport.authenticate(provider, option, null)(req, res, next)
    } else {
      this.sendResponseError(res, this.responseCodes.HTTP_403) // Forbidden
    }
  }

  passportAuthCallback = (req, res, next) => {
    const { provider } = req.params
    if (provider && authProviders.indexOf(provider) >= 0) {
      const passportCallback = (err, user/*, info*/) => {
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
          // ????????? JWT ?????? ???????????? ??????
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
      }
      passport.authenticate(provider, passportCallback, null)(req, res, next)
    } else {
      this.sendResponseError(res, this.responseCodes.HTTP_403) // Forbidden
    }
  }

  signout = (req, res) => {
    const { userId, provider } = req.body

    if (userId && provider) {
      // ???????????? ?????? ??????
      this.userLogModel.findOne({ userId, provider })
        .then((resultData) => {
          const date = new Date()

          if (resultData) {
            // signin ????????? ?????? ??? ????????? ???????????? update ????????? ??????.
            return this.userLogModel.update({ userId, provider }, { $push: { signoutLogs: date } })
          } else {
            throw new Error('No user log info to write signed-out time.')
          }
        })
        .then((resultData) => this.sendResponse(res, resultData))
        .catch((err) => this.logWarn(err)) // ?????? ?????? ??? ?????? ????????? ???????????? ??????
    } else {
      this.sendResponse(res, {})
    }
  }
}
