import { AppError } from "../errors.js"

// eslint-disable-next-line
const handleError = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    // eslint-disable-next-line
    console.error(err)

    res.send({
      error: ["Mamma mia! Something went wrong."],
      errorCode: "error",
    })

    return
  }

  res.status(err.httpCode).send({ error: err.errors, errorCode: err.errorCode })
}

export default handleError
