module.exports = {
  external: ['class-transformer/storage', '@scalar/nestjs-api-reference', '@scalar/types', '@scalar/openapi-types'],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};
