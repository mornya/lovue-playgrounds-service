/*
 * express.js 서버 설정
 */
import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import http from 'http'
import https from 'https'
import { responseCodes, responseError } from 'utils/Response'

const app = express()
const servers = {
  http: null,
  https: null,
}

const start = (routeSet, passport = null) => {
  const { PORT, HTTP_PORT, HTTPS_PORT, JWT_SECRET, PATH_ASSETS } = process.env

  app.disable('x-powered-by')

  // View engine setup
  app.set('views', path.join(__dirname, '..', PATH_ASSETS, 'views'))
  app.set('view engine', 'pug')

  // JWT secret key
  app.set('jwt-secret', JWT_SECRET)

  // Logger
  app.use(logger('dev', {
    skip: () => app.get('env') === 'test',
  }))

  // Set parsers
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  // Set public path
  app.use(express.static(path.join(__dirname, '..', PATH_ASSETS)))

  // for IFrame
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'deny')
    next()
  })

  // Initialize passport if use
  if (passport) {
    app.use(passport.initialize())
    app.use(passport.session())
  }

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,authorization')
    next()
  })

  // Route from root
  app.use('/', routeSet)

  // Catch 404 and forward to error handler
  app.use((req, res, next) => { // eslint-disable-line no-unused-vars
    responseError(res, responseCodes.HTTP_404)
  })

  // Error handler
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    //res.status(err.status || 500).render('error', { message: err.message });
    if (err.errorCode) {
      responseError(res, err.errorCode)
    } else {
      responseError(res, responseCodes.HTTP_500)
    }
  })

  return new Promise((resolve, reject) => {
    const httpPort = PORT || HTTP_PORT || 8080 // 헤로쿠를 위한 포트 우선순위
    const httpsPort = HTTPS_PORT || null

    if (app.get('env') === 'test') {
      servers.http = http.createServer(app).listen(httpPort, () => {
        resolve(app) // returns only variable 'app' for testing
      })
    } else {
      servers.http = http.createServer(app).listen(httpPort, () => {
        if (httpsPort) {
          const pathSSLKey = path.resolve(__dirname, '..', 'ssl-key.pem')
          const pathSSLCert = path.resolve(__dirname, '..', 'ssl-cert.pem')
          if (fs.existsSync(pathSSLKey) && fs.existsSync(pathSSLCert)) {
            const sslOptions = {
              key: fs.readFileSync(pathSSLKey),
              cert: fs.readFileSync(pathSSLCert),
            }
            servers.https = https.createServer(sslOptions, app).listen(httpsPort, resolve({ httpPort, httpsPort }))
          } else {
            reject(`"ssl-key.pem" or "ssl-cert.pem" file is not exists!`)
          }
        } else {
          resolve({ httpPort, httpsPort })
        }
      })
    }
  })
}

const stop = () => {
  return new Promise((resolve, reject) => {
    if (servers.http || servers.https) {
      if (servers.http) {
        servers.http.close(resolve)
        servers.http = null
        console.info('Stopping HTTP server was succeed..')
      }
      if (servers.https) {
        servers.https.close(resolve)
        servers.https = null
        console.info('Stopping HTTPS server was succeed..')
      }
    } else {
      reject('No HTTP server was started!')
    }
  })
}

export default {
  start,
  stop,
}
