const fs = require("fs")
const path = require("path");
const { wrap : async } = require("co");
const tinify = require("tinify");
const chalk = require("chalk");
const imageinfo = require('imageinfo');
const filesize = require('filesize.js');
const log = console.log;
// tinify.key = "hR3n9yi9_UC0RAhzHpylIS_b911mUiGY";

// 获取操作系统分隔符
const sep = path.sep;

let compressIndex = 0;
// 文件列表
let fileArr = [];
let fileList = {};

let defaultOptions = {
	compressPercent: 5
}

let firstInput;

/**
 * @function compressImage
 * @description 压缩图片
 * @param {string} input - 要压缩图片所在的目录
 * @param {string} output - 压缩图片保存目录
 * @param {object[]} options - 压缩参数
 * @param {number} [options[].compressPercent=10] - 压缩比例限制,默认为10
 */

function compressImage(input,output='./.tinify',options=defaultOptions) {
	const {compressPercent,tinifyApiKey} = options;
	if(compressIndex === 0){
		if(!tinifyApiKey){
			log(chalk.red(
				`tinifyApiKey is't null or undefined!`
			));
		}
		// 配置tinify
		tinify.key = tinifyApiKey;
		firstInput = input;
		// 判断给定的目录是否存在
		const isInputExists = fs.existsSync(input);
		if(!isInputExists) process.exit(1);
		// 判断output目录是否存在
		const isOutputExists = fs.existsSync(output);
		if(!isOutputExists) fs.mkdirSync(output);
		// 读取给定目录中的所有图片文件列表
		fileArr = fs.readdirSync(input);
		fileArr.forEach((item , index) =>{
			fileList[item] = {};
			fileList[item].index = index;
			fileList[item].path = item;
		});
	}

	/**
	 * @function tinifyPromise
	 * @description 上传图片到tinypng服务器
	 * @param {buffer} sourceData - 文件内容
	 * @returns {Promise}
	 */

	function tinifyPromise(sourceData){
		return new Promise( (resolve,reject) => {
			tinify.fromBuffer(sourceData).toBuffer( (err, resultData) => {
				if (err) reject(err);
			    resolve(resultData);
			});
		});
	}

	/**
	 * @function callBySelf
	 * @description 自调用compressImage函数
	 * @returns {void}
	 */

	function callBySelf() {
		compressIndex ++ ;
		if(compressIndex === fileArr.length) process.exit(1);
		compressImage(firstInput,output,options);
	}

	/**
	 * @function caleOptimizePercent
	 * @description 计算压缩比例
	 * @param {number} originalSize - 文件原来的大小
	 * @param {number} compressedSize - 文件压缩后的大小
	 * @returns {number} 压缩比例
	 */

	function caleOptimizePercent(originalSize,compressedSize) {
		const scale =  (originalSize - compressedSize) / originalSize;
		return Math.floor(scale*100);
	}

	/**
	 * @function tinifySync
	 * @description 压缩图片主代码
	 * @param {object[]} fileObj - 文件路径和大小
	 * @param {number} fileObj[].index - 索引
	 * @param {string} fileObj[].path - 文件路径
	 * @returns {void}
	 */

	const tinifySync = async(function* ({ index, path:basename }){
		log(chalk.green(
			`========== compressing ${basename} start! ==========`
		));
		// 获取文件名
		const sourceData = fs.readFileSync(input+sep+basename);
		// 判断文件是否为图片
		let info = imageinfo(sourceData);
		const {type} = info;
		if(!type) {
			log(chalk.red(
				`=================== ${basename} file type is't image format! ===================`
			));
			log(chalk.green(
				`========== compress ${basename} end! ==========`
			));
			callBySelf();
		}else{
			fileList[basename].size = parseInt(filesize(sourceData.length,0));
			const resultData = yield tinifyPromise(sourceData);
			let optimizedFileSize = parseInt(filesize(resultData.length,0));
			const optimizedPercent = caleOptimizePercent(fileList[basename].size,optimizedFileSize);

			let outputFileName = output+sep+basename;
			const writeResult = fs.writeFileSync(outputFileName,resultData);

			log(chalk.green(
				`========== compress ${basename} success! ==========`
			));
			log(chalk.green(
				`========== ${basename} compress scale percent: ${optimizedPercent}%`
			));
			if(optimizedPercent >= compressPercent) {
				compressImage(output,output,options);
			}else{
				callBySelf();
			}
			
		}
	});

	let fileObj = fileList[fileArr[compressIndex]];
	tinifySync(fileObj);
}

module.exports = compressImage;