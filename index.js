const jwt = require("jsonwebtoken");

// Constants.
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const JWT_EXPIRATION_TIME = "1h";

exports.handler = async (event) => {
  try {
    // Gets event body.
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Client will be identified by national id.
    const nationalId = body.nationalId;

    if (!nationalId) {
      return {
        statusCode: 400,
      };
    }
  } catch (error) {
    return {
      statusCode: 400,
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
      expiresIn: JWT_EXPIRATION_TIME,
      algorithm: "RS256",
    },
  };

  try {
    const token = jwt.sign(
      jwtSettings.payload,
      jwtSettings.privateKey,
      jwtSettings.options
    );

    return {
      headers: { "content-type": "application/json" },
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "asd " + error,
    };
  }
};
