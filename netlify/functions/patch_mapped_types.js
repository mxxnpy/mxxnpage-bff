const fs = require('fs');
const path = require('path');

try {
  const mappedTypesPath = path.resolve('./node_modules/@nestjs/mapped-types/dist/type-helpers.utils.js');
  
  if (fs.existsSync(mappedTypesPath)) {
    let content = fs.readFileSync(mappedTypesPath, 'utf8');
    
    // Replace the problematic require with a try/catch block
    content = content.replace(
      "classTransformer = require('class-transformer/storage');",
      "try { classTransformer = require('class-transformer/storage'); } catch (e) { classTransformer = {}; }"
    );
    
    fs.writeFileSync(mappedTypesPath, content);
    console.log('Successfully patched @nestjs/mapped-types module');
  } else {
    console.log('Could not find @nestjs/mapped-types module');
  }
} catch (error) {
  console.error('Error patching @nestjs/mapped-types:', error);
}