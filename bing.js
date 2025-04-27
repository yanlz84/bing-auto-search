// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.12
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
var default_search_words = ["助力全国统一大市场建设", "84斤女子吐槽买百件衣服基本穿不上", "伊朗一港口发生高强度爆炸", "五一大量外国人涌入中国", "中使馆回应“特朗普称中国须让步”", "陈妍希：假的就是假的它真不了", "女子网购避孕套被骑手骚扰", "印度男子婚礼当天新娘被调包成岳母", "多地宣布发钱奖励结婚", "家属称溺水“美人鱼”仍在ICU", "巴萨3比2皇马夺得国王杯冠军", "包头出现“天价骨灰盒”？假", "3名中国公民在伊朗港口爆炸中受伤", "七旬老人7天偷100多个快递被刑拘", "47岁刘烨“瘦到皮包骨”引热议", "伊朗港口爆炸已致14死700多伤", "深圳新鹏城1-1大连英博", "巴基斯坦军方打死15名恐怖分子", "谢霆锋儿子现身演唱会", "张柏芝：也曾觉得“恋爱大过天”", "俄方称已收复库尔斯克 普京表态", "男子裸露下体偷进房间藏在女生床下", "《我爱你》获华表奖3项提名", "地平线CEO余凯：智能驾驶应回归理性", "保安每天偷用女员工杯子喝水", "“爱泼斯坦案”关键证人自杀身亡", "肖战追星和我们也没区别", "以军称已打击加沙逾1800个目标", "印媒称印巴再度交火 局势会否升级", "愿无先决条件谈判 俄乌迎来拐点？", "“方便门”毁了数万跑者的盛大赛事", "给特朗普献计的人不懂中国", "吕迪格等3名球员因和裁判冲突吃红牌", "华山引进“爬山神器”外骨骼设备", "五角大楼把休息室整成化妆间？", "美媒：特朗普“对抗中国”策略落空了", "特朗普用P的图“甩锅”中国", "韩国一公司要求员工每天至少洗澡1次", "《你好星期六》石凯镜头被剪", "长春亚泰1-2成都蓉城 韦世豪破门", "蔡徐坤直播突然被封", "谷歌将停止对早期Nest恒温器支持", "周深说唱电影的歌是最幸福的", "工作室回应唐伯虎被曝拖欠劳务费", "特朗普回应“一天结束俄乌战争”", "张镇麟10投3中拿到7分", "乌军方：俄收复库尔斯克说法不实", "韩红演唱会嘉宾是薛之谦", "把六旬老人吴镇宇气成小伙了", "中国羽协主席张军任世界羽联理事", "蔡正元回应戴脚镣后是否还会上节目"]

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
