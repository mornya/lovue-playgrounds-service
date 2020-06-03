export default {
  alpha2Code: { type: String, required: true },
  alpha3Code: { type: String, required: true },
  numericCode: { type: Number, required: true },
  officialName: { type: String, required: true },
  localName: { type: String, required: true },
  capital: { type: String },
  localISOCode: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  currency: { type: String },
  currencyCode: { type: String },
  timeZone: { type: String },
  internetTLD: { type: String },
  phoneCode: { type: String },
  daylightSavingFlag: { type: String, required: true },
  specialFlag: { type: String, required: true },
  memo: [
    {
      id: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
}
