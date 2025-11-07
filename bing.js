// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.401
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
var default_search_words = ["习近平视察福建舰", "《西游记》沙僧扮演者刘大刚去世", "中方：中国核力量与美俄不在同一量级", "50秒带你上乌镇摸摸“未来”", "福建舰入列", "荒野求生女选手“冷美人”熬走80人", "净网：虚假摆拍直播绑架 4人被行拘", "中国最好吃的羊肉都在这张地图里", "山姆会员再也忍不下去了", "福建舰入列意味着什么", "大雪暴雪即将上线", "成都龙泉山将举办荒野求生赛不实", "白宫宣布减肥药降价 药企高管晕倒", "首饰店老板提醒路边黄金千万别捡", "这种羽绒服穿得越久危害越大", "西安市委书记方红卫被查", "六小龄童悼念刘大刚", "福建舰入列现场高清大图来了", "女装退货率高达50%至60% 商家无奈", "刘大刚四大名著演了三部", "家属回应刘大刚去世", "《西游记》两位沙僧扮演者均离世", "沙僧扮演者刘大刚去世 最后露面曝光", "福建舰入列可震慑“台独”武装", "福建舰研发团队为2秒坚守了20年", "中方回应日本水产品两年来首次输华", "云南“药王”为两女儿分股份", "荒野求生退赛后最克制的选手出现了", "福建舰入列背后的中国大布局", "为什么父母宁愿忍着也不愿看牙", "“唐僧”迟重瑞悼念刘大刚", "全运会跳水再次出现0分", "福建舰为何在11月5日入列", "网传安徽二胎补贴被追回 当地回应", "中国抓拍到的星际来客到底什么来头", "保安和AI对话数月 打印50万字讨说法", "荷兰预计安世中国将恢复芯片供应", "立冬该吃饺子还是喝羊肉汤", "福建舰会去印度洋大西洋等更远的地方", "福建舰入列带来了哪些飞跃", "4500亿国补落幕 谁是最大受益者", "海关总署：恢复3家美企大豆输华资质", "国航载旗C919今日首飞香港", "装修工人触电身亡婚房变“凶宅”", "俄罗斯挫败一起恐袭图谋", "美大豆出口协会：中国市场无可替代", "比小学生说烂梗更可怕的是大人也说", "奶茶里加酱油？秋冬咸奶茶突然爆火", "泡泡玛特股价大跌", "美国裁员规模创新高", "福建舰、山东舰为何都在三亚入列"]

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
