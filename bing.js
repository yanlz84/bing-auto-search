// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.263
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
var default_search_words = ["建设繁荣发展的共同家园", "多国领导人抵华", "上海高温破百年纪录", "上合天津峰会背景知识了解一下", "几乎绝迹的床虱又出现了", "刚续保2小时就出车祸 保险公司拒赔", "净网：82万粉丝网红谎报灾情被处罚", "男子16年后偶遇初恋光速订婚", "印度总理莫迪抵达天津", "这些补贴、补助要记得领", "河南小伙制作AI穿越短片纪念先辈", "漂亮饭叶子按片卖：用尺子量大小", "iPhone 17 Pro被吐槽丑", "记者调查“正骨馆”乱象", "特朗普怒了：将给美国带来彻底灾难", "“警察叔叔 我要举报我妈妈”", "教师与学生不文明聊天被曝光 已辞退", "男子称在赛里木湖发现外来入侵物种", "章建平紧急声明：不是赚56亿的章建平", "乒超联赛：王楚钦vs孙闻", "191式步枪为啥成阅兵选定的枪", "上海药皂深陷苏丹红风波一月无回应", "直击苏超：泰州vs常州", "常州队开场4分半就丢球", "48年前72秒“外星信号”被破译", "体温计被弄坏女子喝下含水银水", "刘强东带妻子观战苏超", "学校午休室睡上百学生不必惊讶", "直击苏超：宿迁vs淮安", "董璇遇到张维伊像“老来得子”", "教师与学生不雅聊天 辞退只是第一步", "泰国内阁任命普坦为代理总理", "男性无名尸体在大理殡仪馆存放13年", "直击苏超：盐城vs无锡", "杨幂：我会合法纳税的", "#那些年我经历的阅兵现场#", "农村女孩6年从职校生逆袭成副教授", "刘强东凌晨现身老家夜市 塑料碗喝酒", "普京将在中国会见莫迪 系今年首见", "多人站桥梁护栏上跳水后护栏坍塌", "多地公布今年七夕结婚登记数据", "上海阿姨偶遇受伤男孩 塞给他500元", "杭州多所学校通知无须补暑假作业", "董璇请合作过的婚礼策划：新郎换人了", "敦煌夜市上厕所以为误闯石窟", "新款iPhone将面世 三星发广告调侃", "金正恩会见援俄朝军烈士遗属", "莫迪在日表态：与华保持紧密至关重要", "他信家族“一门四总理”均被赶下台", "9月全球市场最大的风险或来自日本", "这届年轻人迷上了“养成系”盘葫芦"]

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
