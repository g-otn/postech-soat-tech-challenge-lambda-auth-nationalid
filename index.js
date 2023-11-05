const jwt = require("jsonwebtoken");

// JWT constants.
const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

// HTTP constants.
const HTTP_SUCCESS_STATUS_CODE = 200;
const HTTP_BAD_REQUEST_STATUS_CODE = 400;
const HTTP_INTERNAL_SERVER_ERROR_STATUS_CODE = 500;

// Endpoints.
const HOST = "";
const CLIENTS_IDENTIFICATION_URL = `${HOST}/clients/identification`;

// Params.
const NATIONAL_ID_QUERY_PARAMETER = "nationalId";

const parseEventBody = (body) => {
  try {
    return typeof body === "string" ? JSON.parse(body) : body;
  } catch (error) {
    return null;
  }
};

const getNationalIdFromEvent = (event) => {
  const body = parseEventBody(event.body);

  return body?.nationalId;
};

const getClientIdByNationalId = async (nationalId) => {
  const response = await fetch(
    `${CLIENTS_IDENTIFICATION_URL}?${NATIONAL_ID_QUERY_PARAMETER}=${nationalId}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    }
  );

  return response?.data?.id;
};

exports.handler = async (event) => {
  const nationalId = getNationalIdFromEvent(event);

  if (!nationalId) {
    return {
      statusCode: HTTP_BAD_REQUEST_STATUS_CODE,
    };
  }

  try {
    const clientId = await getClientIdByNationalId(nationalId);

    const token = jwt.sign(
      {
        sub: clientId,
      },
      JWT_PRIVATE_KEY,
      {
        expiresIn: "1h",
        algorithm: "RS256",
      }
    );

    return {
      headers: {
        "content-type": "application/json",
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
