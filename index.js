const jwt = require('jsonwebtoken');

process.env.JWT_PRIVATE_KEY =
  'MIIEowIBAAKCAQEAqStd8n4SGNM0eZhV/hzU+urHA5/IMZPoP9YQ9ZcLKWiX33nI6bSuZMCrLZcJExf63xS+uxDpGxM8Mnk2zOdl+lPwANXLzP1us5P1PyA3YPycW9J7C5YTQW0GiEL3M93ZX7vMJiVoBYblP3JPlYnoYlBORuc0JPk33KtfEZP+78qXpPHM8imYrJLe8ceiDLLFDU/nh5KC2dWAy3ci1ahoJ1Q9ELhp3IZLvOTX57H/T2VKOYOya5+ST41h+JjzI+qGTVnLcKaW+k25YLlVnkSspvdx98+yQDi7kbOTS6yRZHUPD6wPk/nUozpD0nZKccoH4W+zMwmQVtsAA6JCA9gfGwIDAQABAoIBAEU/KbkpzumXhsrhRw36Klo9gVJj9NQKec6rpwyIk/qSxFwnY0z690nprgg+42mL7tajDMHRFcJN+N2mTX7Jl65E7qDA4ygZc1eR0JlS7ChIrw5NFa3z9BTbdomPc9Yo0SKFYncY58AfbDaw6Y/KQDQCMFCIsokR9MJg6cztujTYGykj204TBoFvvoiQCHrE/+eXbPmtx+guVdB0NfLBBan0Uhpk0U0mW67tGq0BHJJSkAdOfAbF7AWusgzx90hebmp7wnsw4M3Z33wsqrB2UvgaGX7Di0+j3jWgyShMKsJ/YKykEbR1TEE7j3HSj9k6iK4P8AgCQ887Alm2hwGYMjkCgYEA57M/hZiyDH8r2Qr/qoUBqnbOmfwzUDEFkv4TqzDj3vEMoM9q8Ad4PM2Vzf62SZa4sq2XC0y4KGcAzUctUOWdRHA6d0TLFoS7rKnn2ZtaH5UGPvjrXYdW3NHNktOyjmEkbEyqRxAQGlGzcRAanlj4+X/j+jo2TTo8+hJlowrGDZkCgYEAuulGU4bZckiHvaefFwS2V1iXzxi1N0TalCeKBqcD7MIMbORhXuv+id88ZVfqY5Fp79omw+se1Kmo9XrF/0XgcVhEC4loKHGdAtnn3k0QTFs01nD7A3L7/X3lTDa/msBhZWWF+fYH1BuLdtMxCIt6sw9tyS+KdQLaexoa4pUgetMCgYBcKFSku7Zd+BslqhVE6sBd4AGPB9wVElqIO9zw43JPU4tVTwrWy/HMJW1nUN+KZ5OxJhCE4xAAqe+MtrnUim/CL+1hURCCNWs8Yxwf1oXDOBAS7gkX22P2UtC0jNVhgkvtc5TqzP3KqiJ4XxJnVzY4buDrv0mn7/ke8kBQ2FEsSQKBgCFFeSFRNc/kHVWjSux8CEFQIeXZjhiChy4sQ6Ofg1FX0YJovPR6qdq9BDE+DxkeP29Us+XYKqrMcKkR68DfHW7PuX0cPpBEeSCSzXWC3k3ZRnSNtAEPLNAY4wJIFJ9lc3DrO4gdRZN6O78xJN9ShMrvCinv7oOZuG6FXRfMV/XFAoGBANRegCVzoE/eonh5KuLYO/TjIfGJxSq91dGk5opsYI31Dhxg6Z3DiJBogLp9HRlYzTMqFDc2mpFgs+8ipGOExUYnErW+NMBsCzHU/rSwUa1uXu+jAk3hRsVShIN6N65ykaYvkGSGklGkPhnJehuWwX4cZK4Bv3/nfhG+dX0RPe2u';
const JWT_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----\n${process.env.JWT_PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`;

const BACKEND_URL = process.env.BACKEND_URL; // Internal ALB for ECS

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
  const { id } = await fetch(
    `${BACKEND_URL}/clients/identification?nationalId=${nationalId}`,
    { method: 'POST' }
  ).then((res) => res.json());

  return String(id);
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
      const token = jwt.sign({ sub: clientId.toString() }, JWT_PRIVATE_KEY, {
        expiresIn: '1h',
        algorithm: 'RS256',
      });

      return result(200, { token });
    } catch (error) {
      console.error('Error while generating token', error);
      return result(500, {
        message: 'Error while generating token',
        error: error?.message,
      });
    }
  } catch (error) {
    console.error('Error while verifying national ID', error);
    return result(500, {
      message: 'Error while verifying national ID',
      error: error?.message,
    });
  }
};

const token = jwt.sign({ sub: '124' }, JWT_PRIVATE_KEY, {
  expiresIn: '1h',
  algorithm: 'RS256',
});
console.log(token);
