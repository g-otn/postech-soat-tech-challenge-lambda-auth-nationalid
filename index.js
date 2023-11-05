const jwt = require('jsonwebtoken');

const JWT_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.JWT_PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`;

const HOST = '';

/**
 *
 * @param {number} statusCode
 * @param {any} body
 * @returns {Promise<AWSLambda.APIGatewayProxyResult}
 */
const result = (statusCode, body = null) => {
  return {
    headers: { 'content-type': 'application/json' },
    statusCode,
    body: JSON.stringify(body),
  };
};

/**
 * @param {AWSLambda.APIGatewayEvent} event
 */
const getNationalIdFromEvent = (event) => {
  return event.queryStringParameters?.nationalId;
};

const getClientIdByNationalId = async (nationalId) => {
  return 123;
  const response = await fetch(
    `${HOST}/clients/identification?nationalId=${nationalId}`,
    { method: 'POST' }
  ).catch((err) => {
    console.error('Error during identification request', err);
  });

  return response.data.id;
};

/**
 * @param {AWSLambda.APIGatewayEvent} event
 * @returns {Promise<AWSLambda.APIGatewayProxyResult}
 */
exports.handler = async (event) => {
  const nationalId = await getNationalIdFromEvent(event);

  if (!nationalId) {
    return result(400, { message: 'Missing national ID' });
  }

  try {
    const clientId = await getClientIdByNationalId(nationalId);

    try {
      const token = jwt.sign({ sub: clientId }, JWT_PRIVATE_KEY, {
        expiresIn: '1h',
        algorithm: 'RS256',
      });

      return result(200, { token });
    } catch (error) {
      console.error('Error while generating token', error);
      return result(500, { message: 'Error while generating token' });
    }
  } catch (error) {
    return result(500, { message: 'Error while verifying national ID' });
  }
};
