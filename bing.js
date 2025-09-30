// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.325
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
var default_search_words = ["习近平向人民英雄敬献花篮", "国庆第一批游客已到目的地", "谈崩了 美国政府“关门”在即", "双节将至 这份出行安全提示请查收", "赛力斯：已向华为支付115亿元", "人民日报：曲解K字签证只会误导公众", "年轻人“整顿”月饼", "顺德发现比熊猫血罕见百倍的钻石血", "90后女律师偷30多次蛋糕盒饭被判刑", "吉林“奶头山村”更名为“头山村”", "女子因跛脚被辞退 得力集团致歉", "虎门大桥10月起封闭维修？假", "北京超级晚高峰：车流如白龙赤龙", "女子提前两天上高速 预计能省1400元", "节假日用微信工作算加班吗？法院判了", "刘海星已任中共中央对外联络部部长", "许昆林任辽宁省委书记", "台湾老人强行要年轻人让座被其踹懵", "高速堵车 外国美女被投喂火锅", "比手掌还小！歼-35绝密性能指标曝光", "王楚钦/孙颖莎3-1逆转 晋级混双八强", "出城大军已经堵上了", "以方：愿向身亡卡塔尔人员家属付赔偿", "美或向乌提供战斧导弹 俄强硬质问", "孟晚舟当值华为轮值董事长", "俄罗斯假酒大案已致至少25人死亡", "电影《浪浪人生》今日上映", "美财长收到短信：阿根廷卖大豆给中国", "抗癌博主晒妈妈给自己治病做吃播", "一群博士生涌入外卖赛道", "礼盒月饼普降价 散装月饼“冲上天”", "石家庄空中现不明发光体 官方回应", "刘小涛任江苏省政府党组书记", "上车一看手机就晕？专家支招", "女教师骑电瓶车过漫水桥时落水失联", "央行将开展11000亿元买断式逆回购", "200元起 清北进校园名额仍在出售", "得力CEO称跛脚员工不愿回来入职", "普京最新表态：俄罗斯将取得胜利", "女子称10人花4千元吃自助餐遇蟑螂", "醒来门是开着的？智能门锁为何翻车", "包钢任内蒙古自治区政府党组书记", "老君山国庆期间推出“一元午餐”", "乌克兰计划向美国出口多余武器", "巴基斯坦西南部爆炸袭击致多人伤亡", "中国女孩埃及旅游失联：涉电诈被捕", "这可能是今年国庆最特别的纪念品", "#国庆提前出发的人已堵到怀疑人生#", "阿根廷接中国“大单” 美农民着急了", "国民党主席选举6名候选人首度同台", "美国围绕加沙的“20点计划”是什么"]

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
