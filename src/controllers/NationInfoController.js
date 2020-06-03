import BaseController from 'controllers/BaseController'

export default class NationInfoController extends BaseController {
  constructor (router, { NationInfo }) {
    super()

    this.router = router
    this.router.get('/nationInfo', this.getList)
    this.router.get('/nationInfo/reset', this.postReset)

    this.nationInfoModel = NationInfo
  }

  /**
   * GET /nationInfo
   */
  getList = (req, res) => {
    this.nationInfoModel.find({},
      {
        _id: 0,
        createdAt: 1,
        updatedAt: 1,
      })
      .then((resultData) => this.sendResponse(res, { nations: resultData }))
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
