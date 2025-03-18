// Debug script to help diagnose serverless function issues
exports.handler = async function(event, context) {
    console.log('Debug function called');
    
    // Log environment information
    console.log('Node version:', process.version);
    console.log('Environment variables:', Object.keys(process.env));
    
    // Log event information
    console.log('Event path:', event.path);
    console.log('Event httpMethod:', event.httpMethod);
    console.log('Event headers:', event.headers);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Debug information logged',
        nodeVersion: process.version,
        envVars: Object.keys(process.env),
        path: event.path,
        method: event.httpMethod
      })
    };
  };
  