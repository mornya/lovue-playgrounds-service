import BaseController from 'controllers/BaseController'

export default class NationInfoController extends BaseController {
  constructor (router, { NationInfo }) {
    super()

    this.router = router
    this.router.get('/nationInfo', this.getInfo)
    this.router.get('/nationInfo/:alpha2Code', this.getInfo)
    this.router.get('/nationInfo/memo/:alpha2Code', this.getMemo)
    this.router.post('/nationInfo/memo/:alpha2Code', this.postMemo)
    this.router.post('/nationInfoReset', this.postReset)

    this.nationInfoModel = NationInfo
  }

  /**
   * GET /nationInfo
   * GET /nationInfo/:alpha2Code
   */
  getInfo = (req, res) => {
    const { alpha2Code } = req.params
    this.nationInfoModel.find(
      alpha2Code ? { alpha2Code } : {},
      {
        _id: 0,
        __v: 0,
        memo: 0,
      })
      .then((resultData) => this.sendResponse(res, resultData))
      .catch((err) => this.sendResponseException(res, err))
  }

  /**
   * GET /nationInfo/memo/:alpha2Code
   */
  getMemo = (req, res) => {
    const { alpha2Code } = req.params
    this.nationInfoModel.findOne(
      { alpha2Code },
      {
        _id: 0,
        memo: 1,
      })
      .then((resultData) => this.sendResponse(res, resultData.memo))
      .catch((err) => this.sendResponseException(res, err))
  }

  /**
   * POST /nationInfo/memo/:alpha2Code
   */
  postMemo = (req, res) => {
    const { alpha2Code } = req.params
    const { memo } = req.body
    this.nationInfoModel.findOneAndUpdate({ alpha2Code }, { memo })
      .then((/*resultData*/) => this.sendResponse(res, {}))
      .catch((err) => this.sendResponseException(res, err))
  }

  /**
   * POST /nationInfo/reset
   */
  postReset = (req, res) => {
    this.nationInfoModel.deleteMany({})
      .then(async (/*resultData*/) => {
        // nationInfo.json
        const nationInfo = require('constants/nationInfo.json')
        console.info(`Insert ${nationInfo.length} nation information now...`)

        for (const nation of nationInfo) {
          console.info(`+ ${nation.localName}`)
          await this.nationInfoModel.create({
            alpha2Code: nation.alpha2Code,
            alpha3Code: nation.alpha3Code,
            numericCode: nation.numericCode,
            officialName: nation.officialName,
            officialNameLocal: nation.localName,
            fullName: nation.officialName,
            fullNameLocal: nation.localName,
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

        // nationMoreInfo.json
        const nationMoreInfo = require('constants/nationMoreInfo.json')
        console.info(`Insert ${nationMoreInfo.length} nation more information now...`)

        for (const nation of nationMoreInfo) {
          const resultData = await this.nationInfoModel.findOne({ officialName: nation.countryEnName })
          if (resultData) {
            console.info(`> ${nation.countryEnName} -> ${resultData.officialName}`)
            await this.nationInfoModel.findOneAndUpdate(
              { officialName: nation.countryEnName },
              {
                $set: {
                  fullName: nation.fullName,
                  fullNameLocal: nation.fullNameLocal,
                  capitalLocal: nation.capitalLocal,
                  continent: nation.continent,
                  language: nation.language,
                  flagImageUrl: nation.imgUrl,
                },
              },
              { returnNewDocument: true },
            )
          }
        }

        console.info(`✔︎ Insert nation information was done!`)

        return this.sendResponse(res, {})
      })
      .catch((err) => this.sendResponseException(res, err))
  }
}
