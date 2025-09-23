// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.310
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
var default_search_words = ["像石榴籽一样紧紧抱在一起", "全球最强台风明日登陆广东", "深圳：建议准备至少3天的应急物资", "唱着民歌迎丰收", "安理会五常仅美国未承认巴勒斯坦国", "广东福建大暴雨 台湾局地特大暴雨", "268万翡翠标错价按26.8万卖出", "福建舰“三弹成功”意味着什么", "法国宣布正式承认巴勒斯坦国", "牛弹琴：以色列的最大麻烦来了", "直击超强台风“桦加沙”", "业主私挖地下室挖通河道系谣言", "55岁男演员家中猝逝 多日后被发现", "背篓老人等公交被拒载 司机被开除", "你知道这三年福建舰是怎么过的吗", "英伟达拟向OpenAI投资1000亿美元", "榴莲降至15元一斤", "00后女子醉驾致3死案今日开庭", "中国订单至今为零 美国豆农感受痛苦", "成都体育生跳越10把椅子一次成功", "福建舰上新 打击范围覆盖第二岛链", "孩子的数学逻辑比运算结果重要", "法国球星登贝莱荣膺2025年金球奖", "日本“苹果病”流行达历史顶点", "多国在联合国宣布承认巴勒斯坦国", "59岁青岛大爷放下百万生意演短剧", "美股收盘：三大股指齐创历史新高", "囤物资贴窗户 广东备战“桦加沙”", "柬埔寨一军人为妻子出头枪杀3人", "苑举正：中国重回盛世", "美团回应外卖功能瘫痪", "环保专家正清理烟花秀现场紫铜等物", "港珠澳大桥主桥将封闭", "产妇凌晨路边产子目击者发声", "台风“桦加沙”将影响青岛", "六旬男子连挖10座墓偷11个骨灰盒", "臭宝品牌方回应吃出脚趾甲和烟头", "巴西：美方行为是对巴内政新一轮干涉", "天津航空航班降落时偏出跑道", "均胜电子回应热失控自动弹射电池", "对巴勒斯坦国的“承认潮”有啥影响", "阿富汗塔利班强硬回应特朗普威胁", "周杰伦称有一堆歌已经写好了", "亚马尔再次获得科帕奖", "台武术教练因轻微碰撞暴打台大男生", "国家卫健委：不建议未成年人医美", "辛选主播变更为合伙人制", "金正恩：若美不要求无核 朝美可对话", "俄谢列梅捷沃机场临时限制航班起降", "始祖鸟母公司股价大跌", "台当局赴美花百亿采购引岛内愤怒"]

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
