// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.150
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
var default_search_words = ["把顶层设计和问计于民统一起来", "今日有毁灭性大地震？日本政府回应", "团购价318元吃完结账变2297元", "这些创新高地正在拔地而起", "特朗普签法案 B-2轰炸机飞越白宫", "山东舰抵港 男子无人机航拍被拘留", "林志玲称带孩子没有优雅这件事", "网友晒超速罚单 车速17052km/h", "成都男子在暴雨中街头冲浪", "陈楚生唱情歌像失恋了几百回", "成都暴雨家中插座出水成瀑布", "可以领“国家财政补贴”？假的", "乌总统：俄对乌发动规模最大空袭之一", "今年三伏天10年难遇 有啥讲究", "《歌手》李佳薇揭榜成功 者来女淘汰", "杨幂摔出了神图", "中国驻日使馆提醒：密切关注地震动态", "巴空军称平常训练比和印军实战更难", "10元快剪店理发师月入2万", "“热死人”不是开玩笑", "特朗普签署“大而美”法案", "日本末世预言有民众随身带遗嘱", "上海将剩面二次销售饭店被立案调查", "费大厨招服务员要本科以上 后续来了", "小伙到杭州一天抓12-15斤知了", "《歌手》第八期单依纯排名第三", "违停者屡次开门杀车主自费装护栏", "独居老人网购花费200万睡在快递上", "全国用电负荷超14亿千瓦 历史新高", "意大利男子靠近熊自拍被拖入山沟", "新加坡游泳世锦赛中国队名单公布", "天水幼儿园血铅异常超50人邻省血检", "中国船舶吸并中国重工获准", "航拍山东舰夜泊维多利亚港", "俄乌继续等额交换战俘", "《奔跑吧》李昀锐这一跃打破不可能", "中央气象台发布台风蓝色预警", "“上菜像端地雷”的暑假工火了", "萨巴伦卡三进温网16强", "印度拟对美国征收报复性关税", "在日华人谈日本大地震预言：一笑而过", "哈马斯就停火提案做出回应", "小鹏G7能成下一个爆款吗", "世俱杯1/4决赛 帕尔梅拉斯vs切尔西", "SpaceX太平洋环礁火箭项目被叫停", "泽连斯基：乌将增产拦截型无人机", "久尔杰维奇：国足不惧任何对手", "鹿晗嘱咐粉丝男朋友：照顾好她", "游客坐过山车弄丢人工耳蜗 景区帮忙", "面馆将客人剩面二次上桌 顾客怒怼", "商户直播暴露中方军舰动态被处置"]

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
