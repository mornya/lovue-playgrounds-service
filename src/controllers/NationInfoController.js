import BaseController from 'controllers/BaseController'

export default class NationInfoController extends BaseController {
  constructor (router, { NationInfo }) {
    super()

    this.router = router
    this.router.get('/nationInfo', this.getInfo)
    this.router.get('/nationInfo/:alpha2Code', this.getInfo)
    this.router.get('/nationInfo/memo/:alpha2Code', this.getMemo)
    this.router.post('/nationInfo/memo/:alpha2Code', this.postMemo)
    this.router.get('/nationInfoReset', this.postReset)

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
   * POST /nationInfoReset
   */
  postReset = (req, res) => {
    // Node.js에서 API 처리시간이 길어지면 TCP접속을 끊어버린다.
    // 브라우저단에서는 TCP접속이 끊기게 되면 retry를 하게되는데, API 처리 중인데 재요청이 들어오게 된다.
    // 헤로쿠 등에서는 전체 데이터 저장이 느리므로, timeout을 늘려 위 현상을 방지한다.
    req.connection.setTimeout(300000) // 5*60*1000 (5분)

    this.nationInfoModel.deleteMany({})
      .then(async (/*resultData*/) => {
        const unmatchedNation = []
        let insertedCount = 0
        let updatedCount = 0

        // nationInfo.json
        const nationInfo = require('constants/nationInfo.json')
        console.info(`Insert nation information now...`)

        for (const nation of nationInfo) {
          //console.info(`+ ${nation.localName}`)
          const resultData = await this.nationInfoModel.create({
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
          if (resultData) {
            insertedCount++
          }
        }

        console.info(`Inserted nation information: ${insertedCount} / ${nationInfo.length}`)

        // nationMoreInfo.json
        const nationMoreInfo = require('constants/nationMoreInfo.json')
        console.info(`Update nation more information now...`)

        for (const nation of nationMoreInfo) {
          const resultData = await this.nationInfoModel.findOne({ officialName: nation.countryEnName })
          if (resultData) {
            updatedCount++
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
          } else {
            unmatchedNation.push(nation.countryEnName)
          }
        }

        console.info(`Updated nation more information: ${updatedCount} / ${nationMoreInfo.length}`)
        if (unmatchedNation.length) {
          console.info('Unmatched:', unmatchedNation.join(', '))
        }

        console.info(`✔︎ Insert nation information was done!`)

        return this.sendResponse(res, {})
      })
      .catch((err) => this.sendResponseException(res, err))
  }
}
