// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.321
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["情暖天山", "国际顶尖肺癌专家宣布已患肺癌三年", "“奶奶去世前写的 请大家帮忙辨认”", "带你见证世界级震撼", "江苏常州辅警花明渊被记特等功", "九三阅兵礼宾车正在陆续返还车主", "46个未接来电背后是母亲的无尽牵挂", "70万一针救命药进医保", "高一女生拍野生动物纪录片火了", "印度踩踏事故1万人场地挤进2.7万人", "“湾区升明月”电影音乐晚会", "乌鲁木齐南山发生暴雨山洪系谣言", "女子问自己是否在逃 民警一查还真是", "LV首尔开餐厅3只牛肉饺子243元", "官方通报干部买500斤散酒放单位接待", "老人用手机哄5岁孙子 致1000度近视", "这家89岁的老厂营收超30亿", "俄罗斯支持巴西印度申请入常", "官方回应“唐飞机直播时坠机身亡”", "女子结婚4年才发现婚纱照是陌生人", "司机办事遇“丁义珍式”窗口", "最高法再审改判：车超等人无罪", "农业农村部原部长唐仁健被判死缓", "霸总要没了？广电出手规范管理短剧", "玄学大师落网时被问“算到被抓吗”", "河南一地聘请160名家长到中小学帮厨", "柯洁卫冕棋圣战激动流泪", "老人抱着孩子蹲在门口路边险被车撞", "遭黑熊袭击22岁孕妇右眼球成功复位", "国内最大容量“空气充电宝”送电", "机器人租赁再爆发 国庆需求飙升", "网红坠机身亡：涉事飞机为自行组装", "中小城市“扎堆”建机场", "俄外长回应特朗普称俄是“纸老虎”", "美国豆农遭遇“毁灭性打击”", "象棋世锦赛男单冠军第1次不是中国人", "王毅在京会见朝鲜外相崔善姬", "广西荔浦市公交公司宣布全部停运", "孩子们在导弹发射井上“蹦蹦跳跳”", "10艘国际援助船驶向加沙", "未婚女孩一查征信发现“被结婚”了", "万达知情人士回应王健林被限高", "贵州花江峡谷大桥旁可领证", "正厅级干部景亚萍受贿案通报", "萨科齐牢房床宽0.8米 每天放风1小时", "2025国庆中秋假期天气地图来了", "特朗普下令向美国一城市出兵", "王健林被限制高消费", "老人手术时导丝掉进血管 医院赔8千", "最高检：六种情形醉驾依法从重处理", "埃及大力士用牙齿拉动700吨船只"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
