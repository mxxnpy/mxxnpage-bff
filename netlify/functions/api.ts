import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'API funcionando corretamente',
      path: event.path,
      method: event.httpMethod
    })
  };
};