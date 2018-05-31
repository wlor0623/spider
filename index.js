var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var fs = require('fs');
// 开始时间
const startTime = (new Date()).valueOf();
// 递增页数
let index = 1;
const art = '20181120/70424'
// 初始页数
const startPage = index;

const decode='gb2312'
// 存储根目录
const dir = './images/';
function start() {
  console.log("***程序已启动***")
  getImg(art, index)
}
// 获取图片
function getImg(art, i) {
  if (i == 1) {
    var url = require('url').parse(`http://www.sntaotu.com/pic/images/${art}.html`);
  } else {
    var url = require('url').parse(`http://www.sntaotu.com/pic/images/${art}_${i}.html`);

  }
  http.get(url, function (res) {
    var bufferHelper = new BufferHelper();
    res.on('data', function (chunk) {
      bufferHelper.concat(chunk);
    });
    res.on('end', function () {
      // 转码
      let data = iconv.decode(bufferHelper.toBuffer(), decode);
      const $ = cheerio.load(data);
      // 总页数
      const allPages = 12;
      const postId = $('.h>h1').text();
      // 创建文件夹
      mkdir(dir, postId);
      //图片地址
      const $images = $('#picg>p>a>img');
      console.log("爬虫已爬取" + i + "-" + allPages + "页的图片 已完成" + (Math.floor(((i - startPage) / allPages) * 100)) + "%");
      //图片路径
      const imgSrc = $images.attr('src');
      // console.log(imgSrc)
      //下载图片
      request.head(imgSrc, function (err, res, body) {
        if (err) {
          return console.log("图片下载错误! :(");
        }
      });
      //获取图片后缀名
      var FileExt = imgSrc.replace(/.+\./, "");
      const img_filename = (new Date()).valueOf() + "." + FileExt;
      request(imgSrc).pipe(fs.createWriteStream(dir + postId + "/" + img_filename));
      //递归执行，页数+1
      if (i < allPages) {
        getImg(art, ++index);
      } else {
        var endTime = ((new Date()).valueOf() - startTime) / 1000;
        console.log("***爬虫回家啦 :)！*** 花费" + endTime + "秒");
      }
    });
  })
}

//创建文件夹
function mkdir(path, name) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  if (!fs.existsSync(path + name)) {
    fs.mkdirSync(path + name);
    console.log(name+">文件夹已创建")
  }
}

start();
