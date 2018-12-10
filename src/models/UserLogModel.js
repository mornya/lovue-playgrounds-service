export default {
  userId: { type: String, required: true }, // Identifier
  provider: { type: String, required: true }, // social provider (facebook, naver, kakao, ...)
  signinLogs: { type: Array, required: true }, // logs of signed-in
  signoutLogs: { type: Array, required: true }, // logs of signed-out
};
