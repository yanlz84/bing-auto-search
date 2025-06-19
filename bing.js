// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.118
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
var default_search_words = ["读懂“中国-中亚精神”", "伊朗使用“泥石”导弹打击以色列", "救护车收费2.8万 江西卫健委通报", "缺人！需求近百万 岗位也超多", "普京：伊朗未向俄方请求军事援助", "美航母关闭应答器并停止传输位置", "网警查处冒充“扁担女孩”牟利者", "东方甄选主播顿顿离职", "多地查摆年轻干部混日子等问题", "请收下这份就业避“坑”指南", "特朗普：美不寻求停火 而是要求无核", "广州高铁站被淹？不实", "张杰：一觉醒来我老婆不是我老婆了", "倪萍回应春晚读4张空白贺电", "德国总理称以色列为西方“做脏活”", "广西：将暂停消费品以旧换新补贴", "特朗普接待巴基斯坦陆军参谋长", "以色列特拉维夫南部千余人流离失所", "中央巡视期间 “内鬼”杨长俊被查", "牛弹琴：大战已经开始 下周非常关键", "警方通报成都男子51楼坠亡 排除刑案", "伊朗击落一架以“赫尔墨斯”无人机", "伊朗回应“暗杀最高领袖威胁”", "特朗普不信伊朗没有制造核武器", "刘亦菲出道23年只拍过9部剧", "雷军官宣YU7样车已到店", "广东怀集洪水致超18万人受灾", "中国博主问法飞行员阵风为啥被击落", "马宁怒吼瓜迪奥拉", "王虹回北大开讲座 韦东奕现场听课", "菲律宾央行行长：出手捍卫比索没有用", "普京称愿与泽连斯基会面", "美联储仍预计今年降息两次", "世俱杯：皇马1-1战平利雅得新月", "刘国梁有新身份", "00后女孩醉驾时速174公里撞死3人", "中国女排3-1击败捷克", "朱丹又为自己说错话道歉了", "女子吐槽买水下考古盲盒开出小贝壳", "员工点评女观众外貌被辞退", "马斯克xAI面临巨额资金缺口", "肇庆怀集出现55.22米洪峰水位", "伊外长将与欧及英法德外长举行会谈", "律师解读李雪琴被举报财务问题", "A股回购热潮新动向：金额大执行快", "刘强东：还要给兄弟们涨薪", "全红婵回家摘荔枝", "WTT球星赛：国乒4场外战全胜", "单只基金单次分红金额84亿元创纪录", "青藏线一卡友在车内离世", "俄罗斯告诫美国不要攻击伊朗"]

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
