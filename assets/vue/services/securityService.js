import baseService from "./baseService"

/**
 * @param {string} login
 * @param {string} password
 * @param {boolean} _remember_me
 * @returns {Promise<Object>}
 */
async function login({ login, password, _remember_me }) {
  return await baseService.post("/login_json", {
    username: login,
    password,
    _remember_me,
  })
}

export default {
  login,
}
