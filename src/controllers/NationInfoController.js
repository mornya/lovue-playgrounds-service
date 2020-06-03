import BaseController from 'controllers/BaseController'

export default class NationInfoController extends BaseController {
  constructor (router, { NationInfo }) {
    super()

    this.router = router
    this.router.get('/nationInfo', this.getInfo)
    this.router.get('/nationInfo/:alpha3Code', this.getInfo)
    this.router.get('/nationInfo/:alpha3Code/memo', this.getMemo)
    this.router.post('/nationInfo/:alpha3Code/memo', this.postMemo)
    this.router.post('/nationInfo/reset', this.postReset)

    this.nationInfoModel = NationInfo
  }

  /**
   * GET /nationInfo
   * GET /nationInfo/:alpha3Code
   */
  getInfo = (req, res) => {
    const { alpha3Code } = req.params
    this.nationInfoModel.find(alpha3Code ? { alpha3Code } : {}, {
      _id: 0,
      __v: 0,
      memo: 0,
    })
      .then((resultData) => this.sendResponse(res, { count: resultData.length, result: resultData }))
      .catch((err) => this.sendResponseException(res, err))
  }

  /**
   * GET /nationInfo/:alpha3Code/memo
   */
  getMemo = (req, res) => {
    const { alpha3Code } = req.params
    this.nationInfoModel.find({ alpha3Code }, {
      memo: 1,
    })
      .then((resultData) => this.sendResponse(res, { result: resultData }))
      .catch((err) => this.sendResponseException(res, err))
  }

  /**
   * POST /nationInfo/:alpha3Code/memo
   */
  postMemo = (req, res) => {
    const { alpha3Code } = req.params
    const { memo = { id: '1', content: 'content' } } = req.body
    this.nationInfoModel.findOneAndUpdate({ alpha3Code }, { memo })
      .then((/*resultData*/) => this.sendResponse(res, {}))
      .catch((err) => this.sendResponseException(res, err))
  }

  /**
   * POST /nationInfo/reset
   */
  postReset = (req, res) => {
    this.nationInfoModel.deleteMany({})
      .then(async (/*resultData*/) => {
        const nationInfo = require('constants/nationInfo.json')

        console.info(`Insert ${nationInfo.length} nation information now...`)

        for (const nation of nationInfo) {
          await this.nationInfoModel.create({
            alpha2Code: nation.alpha2Code,
            alpha3Code: nation.alpha3Code,
            numericCode: nation.numericCode,
            officialName: nation.officialName,
            localName: nation.localName,
            capital: nation.capital,
            localISOCode: nation.localISOCode,
            latitude: nation.latitude,
            longitude: nation.longitude,
            currency: nation.currency,
            currencyCode: nation.currencyCode,
            timeZone: nation.timeZone,
            internetTLD: nation.internetTLD,
            phoneCode: nation.phoneCode,
            daylightSavingFlag: nation.daylightSavingFlag,
            specialFlag: nation.specialFlag,
            memo: [],
          })
        }

        console.info(`Insert nation information was done!`)

        return this.sendResponse(res, {})
      })
      .catch((err) => this.sendResponseException(res, err))
  }
}
