// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.285
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
var default_search_words = ["人民教师无上光荣", "中方回应以色列空袭卡塔尔首都多哈", "微信又有新功能 再也不怕发错群了", "以教师之名", "马斯克：美国政府已无药可救", "中美防长视频通话", "当网警遇上教师节 他们是别样的教师", "“老人味”的祸首被揪出 医生提醒", "国务院同意新建黄岩岛自然保护区", "美媒炸了：卡塔尔都被打 下个会是谁", "巨石强森一身肌肉快瘦没了", "所谓7天瘦13斤液断减肥法系误导", "富士康近20万人赶工iPhone 17", "曝那英老公出轨", "阿里美团激战升级", "中方回应特朗普称愿对中印大幅加税", "网红“柴怼怼”被警方带走调查", "男子因楼上噪音杀害邻居被判死刑", "福建多地夜空现不明飞行物", "那英老公否认出轨：因腿伤被搀扶上车", "苹果官网火速下架iPhone 16 Pro", "成龙有新身份", "#为何以军敢轰炸卡塔尔首都#", "合租房生娃被赶夫妻：将重找住处", "小学校长守校门口拦截教师节礼物", "新增橙色配色 iPhone 17 Pro丑吗", "郑州及周边成暴雨大暴雨核心区", "无语哥在天津街头摊煎饼果子", "运20机长：带英雄回家看祖国强盛", "泽连斯基：8架俄无人机进入波兰", "女高管遭老板性侵：仅获2万多赔偿", "2000万房子验出120个问题 业主懵了", "国防部：决不许日本军国主义卷土重来", "石破茂将在联大发表二战演讲", "2岁男童落水 外婆施救双双溺亡", "中方谴责以越境袭击：10枚导弹打1处", "美媒：92名美国人为乌军作战身亡", "100斤女生滥用司美格鲁肽现酮症", "中方回应“日方为反华分子石平撑腰”", "孙颖莎澳门冠军赛开门红", "卡塔尔：以色列袭击造成6人死亡", "男子骑共享单车发现座垫藏“针”", "卡塔尔首相誓言报复以色列袭击", "游客将茶卡盐湖铺路盐成袋装走", "强降雨来了！这些地方或现罕见大暴雨", "六旬大爷拿一辈子积蓄打赏女主播", "外交部回应是否计划从尼泊尔撤侨", "4架歼20护航迎烈士回家", "男子深夜闯入月子会所产妇房间", "检察机关对熊宇等人决定逮捕", "刘宇宁登8月沸点榜一！曾演唱会挥泪"]

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
