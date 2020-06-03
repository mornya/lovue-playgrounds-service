import responseCodes from 'constants/ResponseCodes'

const responseSuccess = (response, data = {}) => {
  const succ = responseCodes.SUCC
  const result = {
    isSuccess: true,
    statusCode: succ.code,
    statusMessage: succ.message,
    payload: { ...data },
  }
  response.status(succ.status).send(result)
  return true // promise.then에서 return이 필요하기 때문에 값을 true로 전달
}

const responseError = (response, errorCode, exceptionInfo = {}) => {
  const error = exceptionInfo.message ? new Error(exceptionInfo.message) : new Error()

  error.isSuccess = false
  error.statusCode = errorCode.code
  error.statusMessage = errorCode.message

  if (exceptionInfo.message) {
    error.exceptionInfo = exceptionInfo
  }

  if (response) {
    response.status(errorCode.status).send(error)
  } else {
    return {
      status: errorCode.status,
      payload: error,
    }
  }
}

export {
  responseCodes,
  responseSuccess,
  responseError,
}
