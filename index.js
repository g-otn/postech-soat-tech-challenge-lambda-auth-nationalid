const jwt = require("jsonwebtoken");

// JWT constants.
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const JWT_EXPIRATION_TIME_IN_HOURS = "1h";
const JWT_RS256_ALGORITHM = "RS256";

// HTTP constants.
const HTTP_SUCCESS_STATUS_CODE = 200;
const HTTP_BAD_REQUEST_STATUS_CODE = 400;
const HTTP_INTERNAL_SERVER_ERROR_STATUS_CODE = 500;
const HTTP_HEADER_CONTENT_TYPE_KEY = "content-type";
const HTTP_HEADER_JSON_CONTENT_TYPE = "application/json";

// General constants.
const STRING_TYPE = "string";

exports.handler = async (event) => {
  try {
    // Gets event body.
    const body =
      typeof event.body === STRING_TYPE ? JSON.parse(event.body) : event.body;

    // Client will be identified by national id.
    const nationalId = body.nationalId;

    if (!nationalId) {
      return {
        statusCode: HTTP_BAD_REQUEST_STATUS_CODE,
      };
    }
  } catch (error) {
    return {
      statusCode: HTTP_BAD_REQUEST_STATUS_CODE,
    };
  }

  ////////////////////////////////////////////////////////////////////////

  // TODO gets client by national id, creates it if no national id matches.

  ////////////////////////////////////////////////////////////////////////

  // TODO pass client id to 'sub' instead of using this '1111111111' hardcoded value.
  // Object that stores values used by 'jsonwebtoken - sign' function call.
  // Sub represents the client ID.
  const jwtSettings = {
    privateKey: JWT_PRIVATE_KEY,
    payload: {
      sub: 1111111111,
    },
    options: {
      expiresIn: JWT_EXPIRATION_TIME_IN_HOURS,
      algorithm: JWT_RS256_ALGORITHM,
    },
  };

  try {
    const token = jwt.sign(
      jwtSettings.payload,
      jwtSettings.privateKey,
      jwtSettings.options
    );

    return {
      headers: {
        [HTTP_HEADER_CONTENT_TYPE_KEY]: HTTP_HEADER_JSON_CONTENT_TYPE,
      },
      statusCode: HTTP_SUCCESS_STATUS_CODE,
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    return {
      statusCode: HTTP_INTERNAL_SERVER_ERROR_STATUS_CODE,
    };
  }
};
