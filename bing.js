// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.126
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
var default_search_words = ["互联互通正塑造中国—中亚新格局", "上海一商业街门头连片坍塌", "杜兰特被交易至火箭", "高温天小心这些物品成为危险品", "何猷君收购王思聪旗下企业", "“韩国霸总”王辉被曝塌房", "特朗普称让伊朗再次伟大 暗示换政权", "伊朗核设施遭美军袭击前后对比", "长沙被奸杀7岁女童的父亲发声", "以色列股市创历史新高", "哈梅内伊高级顾问：游戏远未结束", "广西出台相关育儿补贴政策？假", "伊朗议会赞成关闭霍尔木兹海峡", "“我炸了 我走了”", "美空袭伊朗细节：超125架飞机参战", "伊朗使用新型导弹打击以色列", "伊朗外长抵达莫斯科 将与普京会面", "伊朗向以色列首次发射其最强导弹", "外交部：强烈谴责美方袭击伊朗", "中国代表在安理会谴责美国袭击伊朗", "他们侵吞学生伙食费近350万元", "俄外交部强烈谴责美袭击伊核设施", "合肥通报女童饿肚子隔窗哭着求助", "韩红痛斥歌手依赖耳机提示音", "美国务院发布全球安全警报", "投弹前几分钟特朗普下达最终命令", "美高官承认未摧毁伊朗福尔多核设施", "浙江一大学学费每人每学年9.6万", "白宫官员：特朗普执意袭击伊朗核设施", "伊朗大型军事设施所在地遭袭", "歼-15西太平洋雨中带弹驱离外机", "中国女排0-3不敌意大利", "以军称对伊朗行动迎来转折点", "王欣瑜仍创造中国女网历史", "最后一架美军B-2轰炸机返回基地", "牛弹琴：种种迹象表明美国真可能失败", "卫星图：福尔道核设施出现6个新坑", "叙利亚首都一教堂发生自杀式袭击", "专家：美B-2轰炸机绕路关岛骗了伊朗", "疑似霸凌女排小将 埃格努球品被质疑", "美防长：袭击不针对伊军队或人民", "以色列城市被炸 地标大楼窗户剥落", "马景涛直播中晕倒 本人回应来了", "家人回应16岁少年救落水女子身亡", "孙颖莎人民日报撰文", "叙利亚自杀式袭击死伤人数升至85人", "专家解析美军为何用B-2轰炸机袭伊", "程序员住车里 被质疑占用公共资源", "绝大部分在伊朗中国公民平安撤出", "原油价格大涨 以伊局势牵动全球经济", "福尔道核设施受损情况暂无法评估"]

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
