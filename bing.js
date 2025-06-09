// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.99
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
var default_search_words = ["总书记强调念好“山海经”", "少爷现在所有人都知道你考完了", "马斯克的“星链”卫星突然大批坠落", "2025中国网络文明大会将启幕", "英语听力配音员露脸了", "全网都在祝烤鸭店老板女儿夺魁", "于东来：胖东来人从今天起开始反击", "男子被毒蛇咬伤 当场打死拎着就医", "章子怡拒绝白凯南演纣王", "前5个月外贸运行有何特点亮点", "驻日美军基地发生爆炸", "被AI发现高考作弊记0分？假", "美国壮汉抗议者4拳打懵3名警察", "婚检查出伴侣有艾滋 医生为何隐瞒你", "各地文旅也没放过单依纯", "#洛杉矶骚乱有多严重#", "高以忱被查 曾任国安部副部长", "张靓颖工作室致歉", "洛杉矶乱成一锅粥", "演员秦海璐在《人民日报》撰文", "那尔那茜是否违规建议彻查", "男子好奇抓短尾蝮蛇被咬伤口发黑", "60后大叔高考 8旬老妈：学费自理", "高考作文写得比我人生还精彩", "“美国出了什么问题”", "苹果WWDC 2025亮点前瞻", "龚琳娜力挺单依纯《李白》", "洛杉矶全市进入战术警戒状态", "少林寺回应NBA球星文班亚马闭关修行", "谢霆锋替身车手去世 年仅37岁", "日本火箭发射5秒后爆炸", "牛弹琴：美国“内战”开始了", "胖东来：员工被骂最高补偿10万", "化学考生喊话出题人：下届出难点", "刘品言官宣怀孕", "加州州长“硬刚”特朗普：来抓我吧", "特朗普：将向任何地方派遣军队", "广东考生超绝松弛感：穿拖鞋高考", "主持人曝某三甲医院肠镜检查不关门", "秦始皇“采药昆仑”石刻遭学者质疑", "家长式宠爱：考完试直接“包机”", "泡泡玛特王宁进福布斯中国实时榜前十", "上海航空回应客机起飞绕8圈后返航", "第一批高考结束的同学出现了", "闫妮“送外卖”被多名网友偶遇", "洛杉矶抗议人数不降反升", "高考地理难不难", "游客被打副所长拉偏架被免职不冤", "2025年高考答案流出消息不实", "洛杉矶警方：市中心所有集会均为非法", "白宫驳斥“马斯克曾与美财长互殴”"]

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
