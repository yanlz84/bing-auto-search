// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.411
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
var default_search_words = ["习近平：欢迎费利佩六世国王", "离婚证背面有“囍”字", "微信公布视频通话3大隐藏功能", "搞气氛这块还得看大学生", "这个特大城市突然扩容了", "孙杨抢跳犯规被取消成绩", "暗访神秘培训：学员集体狂舞自曝隐私", "特种兵荒野求生30天退赛：没有盐", "张展硕200自再夺冠！潘展乐第三", "巴基斯坦防长：国家处于战争状态", "“银杏伞”“银杏帽”火出圈", "涉退役军人违法违规账号被处置", "马云妻子花1.8亿买下伦敦豪宅", "北京北部出现极光", "母亲遭民警责骂 男子插话后被群殴", "前DeepSeek研究员罗福莉已加入小米", "中国光伏行业协会声明：小道消息不实", "开车请注意！绿灯不走也违法", "女子被拐33年：用夭折孩子名字长大", "“我怕赖清德没听清楚 再念一遍”", "“大湾鸡”设计师：打不过就加入", "内蒙古呼伦贝尔夜空现绚丽极光", "外交部批日方执意向谢长廷“授勋”", "四川男篮击败辽宁 夺全运会季军", "江苏一寺庙被烧得只剩框架 当地回应", "英伟达市值一晚蒸发1万亿 发生了啥", "人民网：别让“救命钱”变“零花钱”", "农户种300亩杨树被禁止砍伐", "失火的永庆寺是南朝四百八十寺之一", "郑钦文退出全运会网球比赛", "硕士在杭州摆摊卖包子走红", "俄罗斯一高楼塌方 超百辆汽车受损", "比特币洗钱案钱志敏奢靡生活披露", "“馆长”：中国航母将像下蛋一样量产", "直播抓蛇被咬伤 网红被拘留后道歉", "首个飞行汽车工厂落地广州", "国台办：徐国勇胡言乱语、信口雌黄", "82岁富豪拟隐退 近25亿元股票分两女", "山西“狗咬人引发的血案”将开庭", "药店变身小超市 医保卡也被薅羊毛", "“大湾鸡”书包火了 二手最高卖1988", "路边摊爆火成北京炒饭界“排队王”", "豪华别墅民宿占用耕地？烟草局回应", "国安部最新披露：间谍郝某被判无期", "央视曝光买卖艺人隐私链条", "“烂尾车”突然热销 三折可捡漏", "财政部：进一步压实会计工作责任", "证监会：坚决防止市场大起大落", "美州长反复称中国气候治理有远见", "馆长再邀王世坚一起去大陆开演唱会", "张翰疑似新恋情曝光 后援会辟谣"]

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
