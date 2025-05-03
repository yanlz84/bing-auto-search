// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.25
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
var default_search_words = ["青春为中国式现代化挺膺担当", "陈芋汐世界杯夺冠 全红婵获亚军", "前央视主持人被曝转行养鸡", "致敬每双撑起日常的手", "张家界“长”满了外国人", "飞机机长为谋生送外卖 曾年薪百万", "董明珠：有人一有点小钱就搞小三小四", "巴基斯坦呼吁中美俄等介入印巴危机", "知名女星确诊精神疾病 暂停演艺活动", "这个五一各地文旅太拼了", "女生手机自动连上酒店WiFi被分手", "重庆轨道交通有站点塌陷？假", "部分零售商停止向美国客户销售产品", "龙门石窟游船大风中失控 快艇救援", "全红婵老家盖小洋楼 目测两百平", "艾克力亚的脸还是太“权威”了", "中国公民在美车祸身亡 目击者发声", "NBA东部首轮最多打到G6西部两组抢七", "TVB港姐体验做理货员 日入200元", "金店经理监守自盗 偷走9.7万黄金", "台幼儿园园长之子性侵猥亵6女童", "五一旅游被执勤武警帅到了", "赵心童淘汰奥沙利文", "景区回应两名男童在彩虹滑道相撞", "泽连斯基拒绝普京72小时停火提议", "你一句甲天下 我就堵在了真桂林", "于正称吴谨言本月复出", "陈雨菲：上届输给山口茜憋着一口气", "多方回应游客未让座遭两女一男殴打", "普京首次展示在克宫的住所", "44岁郭晶晶出席活动女王气场全开", "余宇涵成吴镇宇人形挂件了", "国民党台中市党部遭搜查 卢秀燕发声", "泰山陪爬小伙2天挣了近2000元", "美国科学家：终于从中国借到了月壤", "于东来抖音账号已私密", "曝华为nova14是第一代纯血nova", "全红婵赛前水中跳舞 扭屁股超可爱", "《水饺皇后》马丽惠英红逆境中相助", "孙俪晒照为小花妹妹庆生", "印度宣布禁止与巴基斯坦的进口贸易", "五一节后A股怎么走", "2025五一档电影票房破5亿", "五问舆论漩涡中的协和“4+4”模式", "陈德容《浪姐》四公肉眼可见的进步", "农村女孩带妈妈旅游 启程前先发誓", "女子3小时喝8杯水 水中毒被送ICU", "这届打工人开始硬刚房东", "美国豪宅亚洲买家离场后去了哪里", "#五一出游玩了个寂寞#", "追梦格林打对手后脑被吹恶意犯规"]

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
