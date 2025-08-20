// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.242
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
var default_search_words = ["格桑花开映山河", "《黑神话：钟馗》官网上线", "俄罗斯对乌克兰发动大规模袭击", "辉煌60载 魅力新西藏", "浙江最年轻县级市48万人干出444亿", "王晶称很多明星爆火都是资本做局", "中印外长会谈达成10项成果", "大专男生回应开面馆陪女友读研", "牛弹琴：这是白宫里前所未见的一幕", "“全国最矮的山”火了", "《黑神话：钟馗》先导预告公布", "山西忻州有车辆失联致10死2伤？假", "毛晓彤方否认与陈晓恋情：未婚且单身", "印度官宣：莫迪即将赴华", "特朗普高调声称结束六场“战争”", "女中医调休6天抽空打场UFC", "“重庆棒棒父子”儿子考上专科", "特朗普问德国总理肤色是在哪儿晒的", "又一只千元股诞生 7月以来几近翻倍", "男子醉驾送早产妻子就医被判无罪", "男子潜入陌生人家中 麻醉女子并抽血", "春秋青铜器展柜里手机的主人找到了", "沃尔宣布退役", "鱼竿被鱼拖走 四川男子捞竿时溺亡", "河南4比3淘汰蓉城", "吧友神预言！《黑神话：钟馗》真来了", "中央巡视期间 温小林落马", "马云现身蚂蚁森林", "男子带侄子隔窗看马蜂窝打破窗户", "美国将407类钢铝衍生品纳入关税清单", "美乌白宫会晤 俄轰炸机动作频频", "一批鳄鱼被法拍 需自行负责抓捕", "“国产数据库第一股”总经理被留置", "日军罪行时隔85年完整曝光", "泡泡玛特新品还没卖已被炒到800元", "疑似女子带2名小孩推走他人婴儿车", "国务院：巩固房地产市场回稳态势", "安徽一未开发山区7月内13人失联", "哈马斯接受停火方案 加沙能否迎转机", "河南队首次闯入足协杯决赛", "环球小姐将首次出现巴勒斯坦参赛者", "中国将继续承办国际高水平体育赛事", "宇树预告新款人形机器人：有31个关节", "35岁仓库工自制器械练就超强腹肌", "美国商务部推进收购英特尔10%股份", "郭正亮：民进党已没有存在价值", "战士重回平型关 带回红军大刀", "涉案近7000万元 前国奥门将遭悬赏", "外交部：机器人正从实验室走向生活", "美欧军事官员将就乌问题举行会谈", "印度士兵遭高速收费站工作人员围殴"]

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
