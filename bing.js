// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.327
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
var default_search_words = ["以人民之心为心", "14小时挪200公里 睡了一觉还在原地", "2亿烂尾楼改酒店 3688元套房被订", "假期出游 这些地方的天气需注意", "女孩过路捡起国旗 交警挡住车流", "杭州西湖景区熟悉的人潮已出现", "网警：双节欢乐游这些“陷阱”要绕行", "南部战区、中国海警发声", "荣昌区政府食堂一顿消耗250斤卤鹅", "被得力辞退跛脚员工再发声：不会回去", "央视国庆晚会", "警方辟谣闺蜜合伙买房反目成仇", "李键违纪违法详情：曾行贿省委书记", "“小龙女”李若彤国庆点赞高铁外卖", "俄罗斯遭大规模“恐怖气球”袭击", "假期首日景区现状：爬山人潮“凝固”", "男生高铁站15秒极限换乘", "蜜雪冰城门店被曝多只老鼠横行", "特朗普宣布“20点计划” 中方表态", "拿到鸡排哥秋招offer的保镖已经上线", "老外排队4小时吃上鸡排直接飙中文", "广东城际一列车疑发生乘客漏乘事故", "“鸡排哥 你的兵来了”", "美国联邦政府正式“关门”", "中国有望2030年用核聚变发电", "车主高速排队3小时充电1小时", "“还是低估了十一堵车的程度”", "去河南的游客被景区物价惊呆了", "哥总统撤换驻华外交官：破坏两国关系", "南非驻法大使跳楼前发诀别短信", "蒋欣国庆在西安真吃爽了", "嫦娥六号有新发现", "十一游客躲避人潮反向涌进小城", "商场斥资百万造10米高“巨人”雕像", "美国要打委内瑞拉？西半球或大乱", "康京和将成韩国首位女性驻美大使", "“天涯海角站”车票火了", "哈尔滨国庆换赛博新皮肤了", "#请汇报国庆假期首日出游实况#", "“鸡排哥”假期裂变式出摊 全家上阵", "上门铲屎官爆单 有人假期能赚近5000", "阮经天恋情曝光 女友小他20岁", "菲律宾地震时正选美 佳丽惊慌逃离", "外籍游客：我不要背叛鸡排哥", "梁靖崑说林高远非常不容易", "直击武汉花车大巡游", "安理会通过涉海地决议 中国投弃权票", "“小酒窝”在天安门举国旗拍照", "58岁任立新出任中国石油总裁", "一文看懂美政府再“关门”闹剧", "女子参加闺蜜婚礼翻山越岭连闯多关"]

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
