const fs = require('fs')
const path = require('path')
const swaggerParser = require('swagger-parser')

// swagger.json
const swaggerUrl = './swagger.json'
// 基础路径
let basePath = ''


// api接口方法存放目录
const API_PATH = path.resolve(__dirname, '../../../src/service')

// 初始化api文件
let fileData = 'import { get, post } from \'./http\'\nexport default {\n'
fs.writeFileSync(`${API_PATH}/api.js`, fileData)

// 判断目录是否存在
const isExist = (lastPath = '') => {
	const filePath = `${lastPath ? API_PATH + '/' + lastPath : API_PATH}`
	const flag = fs.existsSync(filePath)
	if (!flag) {
		fs.mkdirSync(filePath)
	}
}

const toHumpName = (str) => {
    let re = /-(\w)/g; // \w匹配所有的字母和数字字符以及下划线_
    return str.replace(re, function($0, $1) {
        // 第一个参数re表示正则,第二个回调函数,对该字符串处理方式,圆括号内的形参数表示正则表达式的子选项
        return $1.toUpperCase(); // 转大写
    })
}

// 整理出相同模块路径
const getModules = (map) => {
	map.forEach((value, key) => {
		writeFileApi(key, value)
	})
    fs.appendFile(`${API_PATH}/api.js`, '}', (err) => {})
}

// 写入js
const writeFileApi = (fileName, apiData) => {
	const apiDataLen = apiData.length
	for (let i = 0; i < apiDataLen; i++) {
		const item = apiData[i]
		const itemKeys = Object.keys(item)	// 请求方法
		const itemTagKey = itemKeys[0]	// 方法数据信息
		const itemKeysFirest = item[itemTagKey]
		const allPath = item['allPath']
        const pathArr = allPath.split('/')
        const pathNoParam = pathArr.filter(item => {
            return item.indexOf('{') === -1
        })
        let pathParam = pathArr.filter(item => {
            return item.indexOf('{') > -1
        })
        let _pathParam = pathParam.map(item => {
            return '{params.' + item.split('{')[1]
        })

        const path = pathNoParam.join('/') + (pathParam.length > 0 ? '/$': '') + _pathParam.join('/$')
        const _pathName = pathNoParam.reverse().join('-')
        const pathName = toHumpName(_pathName).split('-')[0]
		
		fileData = `\t/** (${itemKeysFirest.tags[0]})${itemKeysFirest.summary} **/\n` +
        `\t${pathName}(params) {\n` +
		`\t\treturn ${itemTagKey}(\`${basePath}${path}\`${pathParam.length > 0 ? '' : ', params'})\n\t},\n`
	}
    fs.appendFileSync(`${API_PATH}/api.js`, fileData, (err) => {})
}

// 入口方法
const apigen = async () => {
	isExist()
	try {
		const parsed = await swaggerParser.parse(swaggerUrl)
        basePath = parsed.basePath
		const paths = parsed.paths
		const pathsKeys = Object.keys(paths)	// 获取url路径
		const pathsKeysLen = pathsKeys.length
		const modulesMap = new Map()
		for (let i = 0; i < pathsKeysLen; i++) {
			const item = pathsKeys[i]
			const pathsItem = paths[item]
			// 完整路径
			pathsItem.allPath = item
			modulesMap.set(item, [pathsItem])
		}
		getModules(modulesMap)
	} catch (e) {
		console.log(e)
	}
}

apigen()