# api-js-codegen

1、 install

    npm install api-js-codegen -s

2、 在根目录创建swagger.json

3、 配置package.json

    "apigen": "node ./node_modules/api-js-codegen/apigen.js"

4、 在src/service目录下创建http.js，封装好axios，并export出post、get方法

5、 执行npm run apigen命令，会在src/service目录下生成api.js



