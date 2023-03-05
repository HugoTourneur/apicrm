import NavMenuModel from "../db/models/NavMenuModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeNavMenu } from "../sanitizers.js"
import {
  hierarchyValidator,
  idValidator,
  nameValidator,
  queryLimitValidator,
  queryOffsetValidator,
} from "../validators.js"

const makeRoutesNavMenu = ({ app, db }) => {
  const checkIfNavExists = async (navId) => {
    const nav = await db("navMenu").where({ id: { navId } })

    if (nav) {
      return nav
    }

    throw new NotFoundError()
  }

  app.get(
    "/nav",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const pages = await NavMenuModel.query().limit(limit).offset(offset)
      res.send({ result: sanitizeNavMenu(pages) })
    })
  )

  app.post(
    "/nav",
    auth,
    mw(async (req, res) => {
      const { name, hierarchy } = req.body
      const { user: sessionUser } = req.session
      const adminAccess = await db("role").where({ name: "admin" })
      const managerAccess = await db("role").where({ name: "manager" })

      if (
        adminAccess.id != sessionUser.roleid &&
        managerAccess.id != sessionUser.roleid
      ) {
        throw new InvalidAccessError()
      }

      const createNavMenu = await NavMenuModel.query().insertAndFetch({
        ...(name ? { name } : {}),
        ...(hierarchy ? { hierarchy } : {}),
      })

      res.send({ result: sanitizeNavMenu(createNavMenu) })
    })
  )

  app.patch(
    "/nav/navId",
    auth,
    validate({
      params: { navId: idValidator.required() },
      body: {
        title: nameValidator,
        content: hierarchyValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { name, hierarchy },
          params: { navId },
        },
      } = req
      const { user: sessionUser } = req.session
      const adminAccess = await db("role").where({ name: "admin" })
      const managerAccess = await db("role").where({ name: "manager" })

      if (
        adminAccess.id != sessionUser.roleid &&
        managerAccess.id != sessionUser.roleid
      ) {
        throw new InvalidAccessError()
      }

      const nav = await checkIfNavExists(navId, res)

      if (!nav) {
        return
      }

      const updatedPage = await NavMenuModel.query().updateAndFetchById(navId, {
        ...(name ? { name } : {}),
        ...(hierarchy ? { hierarchy } : {}),
      })

      res.send({ result: sanitizeNavMenu(updatedPage) })
    })
  )

  app.post(
    "/nav",
    auth,
    validate({
      params: { navId: idValidator.required() },
      body: {
        title: nameValidator,
        content: hierarchyValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { name, hierarchy },
        },
      } = req
      const { user: sessionUser } = req.session
      const adminAccess = await db("role").where({ name: "admin" })
      const managerAccess = await db("role").where({ name: "manager" })

      if (
        adminAccess.id != sessionUser.roleid &&
        managerAccess.id != sessionUser.roleid
      ) {
        throw new InvalidAccessError()
      }

      const createNavMenu = await NavMenuModel.query().insertAndFetch({
        ...(name ? { name } : {}),
        ...(hierarchy ? { hierarchy } : {}),
      })

      res.send({ result: sanitizeNavMenu(createNavMenu) })
    })
  )
}

export default makeRoutesNavMenu
