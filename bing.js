// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.124
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
var default_search_words = ["凝聚发展梦想 引领世代友好", "特朗普：美国已轰炸伊朗核设施", "美军B2轰炸机参与袭击伊朗核设施", "从5月份数据看消费市场新亮点", "特朗普：伊朗福尔多核设施已不存在", "63岁马景涛直播时晕倒", "特朗普称伊朗必须同意结束战争", "阿娇上影节红毯造型显臃肿", "伊媒：美袭击核设施中材料已转移", "中国冥币在海外杀疯老外烧个不停", "伊对以第19波袭击已开始 将持续进行", "伊朗是否有核武 普京特朗普同日表态", "汪峰回应与宁静牵手", "美打击伊朗核设施前已通知以色列", "伊军方：以色列正面临弹药和装备短缺", "特朗普将于10点发表全国讲话", "曝哈梅内伊藏身地堡 已提名接班人", "中考接送车与货车相撞 2名学生遇难", "霍震霆曝儿子霍启仁已结婚", "美媒：美方暂无进一步军事行动计划", "以官员称伊朗核计划遭美国致命打击", "以称伊朗打击已造成近1300人死伤", "网友拍下张家界洪水画面", "中国女排3-1日本女排", "常州0-4南京", "以军称摧毁三架伊朗F-14战斗机", "王欣瑜2比0萨姆索诺娃晋级决赛", "伊拉克民兵武装领导人因以空袭死亡", "食堂阿姨脱稿演讲听哭毕业生", "歌迷风雨无阻赴刀郎重庆之约", "以称对伊西南部目标完成新一轮袭击", "王欣瑜谈首进决赛", "常州主场36712观众刷新苏超纪录", "王欣瑜：我打出了不可思议的网球", "埃及与伊朗两国总统通电话", "胡塞：若美攻打伊 将袭击红海美舰船", "男方资助女子近65万留学分手后索回", "向太回应郭碧婷长得越来越像她", "伊朗总统：绝不放弃和平利用核能权利", "常州“有龙则0”", "保洁阿姨连续三年默默送考", "王兴兴：做一棵照亮别人的“科技树”", "伊朗驻华大使：特朗普白日做梦", "万茜斩获金爵奖影后", "以伊冲突第10天 消耗战可能性增加", "一名摩萨德间谍在伊马赞德兰省被捕", "那尔那茜高考文化课449分", "李晟李佳航真夫妻就是好嗑", "国际原子能机构：伊斯法罕核设施遭袭", "日本北海道沿岸远海发生6.2级地震", "吴梦洁受伤被背下场"]

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
