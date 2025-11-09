// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.405
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
var default_search_words = ["大湾区共此时", "全运会开幕式", "1999年小朋友捐款140元给国家造航母", "一图看懂第十五届全运会", "胖东来销售额破200亿 控速宣告失败", "全运会第一个顶流出现了", "霍震霆：受邀来看十五运开幕式很感激", "荒野求生32天 “冷美人”冒雨搬家", "25岁海军陆战队队员谢丛欣牺牲", "20岁小伙一年猛长25厘米 确诊巨人症", "父亲擅自取出孩子7万存款 法院判还", "新疆一地风机叶片断裂系谣言", "俄多名航空技术人员坠机身亡", "中储粮济宁直属库致7死事故报告公布", "孙中山宋庆龄多段珍贵影像首次公开", "研究员：AI或取代绝大部分人类工作", "山东威海两船相撞渔船沉没 8人失联", "央视新闻频道迎来90后新主播王晨", "全运会观众能量包里有啥 现场开箱", "“荒野第一深情”林北称玩不下去了", "十五运开幕式刘德华压轴登场", "数百人“免费摘菜” 菜农损失近百万", "中国7小时内成功发射两次火箭", "外卖小哥救火超时赔钱 平台回应", "44岁短剧导演心梗离世 当天还在工作", "缅甸政府将拆除KK园区148栋建筑", "7000亿新省级银行获批筹建", "日本本州东部远海发生6.8级地震", "欧洲多国催美国赶紧“还钱”", "歼-50啥时候能上福建舰", "F4复出巡演变F3 朱孝天泄密被排除", "张纯如逝世21周年", "荒野求生选手徒手搭建三层“豪宅”", "如何感受福建舰有多大？开到你眼前", "高速服务区保安深夜偷拿货车生姜", "中国航母舰载机像在“跳舞”", "S15总决赛开幕式好燃", "刘德华为全运会打call", "新一周两股冷空气接连上线", "日本本州东部远海连续发生2次地震", "俄副总理自曝曾亲自下场参战", "不能任由谣言篡改历史DNA", "于适出任中国骑射运动中心执行主任", "这位“六边形”特警有点酷", "“六小龙”齐聚乌镇 目标万亿产业", "S15罗云熙和Uzi同框了", "白宫发言人指称BBC为“假新闻媒体”", "魏建军现身KPL总决赛现场", "“馆长”：未来三四个月来一趟大陆", "全球半导体供应链混乱责任在荷方", "涉密人员退休≠保密责任“退休”"]

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
