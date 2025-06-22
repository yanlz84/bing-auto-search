// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.125
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
var default_search_words = ["总书记强调粮食生产年年要抓紧", "歼-15西太平洋雨中带弹驱离外机", "外交部发布撤侨视频：回家", "“太空之家”里有哪些新动态", "胡塞武装：将重新开始袭击美船只", "外交部：强烈谴责美方袭击伊朗", "45岁高圆圆巴塞罗那被偶遇 美到发光", "老人积水中倒地 民警未搀扶被免职", "伊朗发布福尔多核设施遭袭后画面", "张宇为妻子庆生 罕见披露二人现况", "常州苏超踢0蛋 一景区推出光头免票", "广西出台相关育儿补贴政策？假", "伊朗向以色列首次发射其最强导弹", "常州辟谣“小恐龙”输球被气晕", "伊朗称对以袭击使用40枚导弹", "伊媒：美公民和军人都是打击目标", "伊朗外长：美方袭击将带来可怕后果", "美袭击伊朗核设施 多方发声谴责", "以军称伊朗开始发动“报复性袭击”", "姚晨晒LABUBU原价499被炒至4999", "国家中医药管理局原局长于文明被查", "马景涛直播中晕倒 本人回应来了", "泡泡玛特回应姚晨晒限量版LABUBU", "为啥买LABUBU？姚晨：嘴大有亲切感", "以伊冲突持续 美轰炸伊朗核设施", "长沙被奸杀7岁女童的父亲发声", "多方回应马景涛直播时晕倒", "美军B2轰炸机参与袭击伊朗核设施", "常州球迷输球也快乐", "美国袭击伊朗 斯塔默石破茂等表态", "投了6枚钻地弹 特朗普：不准报复", "打击伊朗后 美国“绷紧神经”", "美媒曝美国通过秘密渠道通知伊朗", "专家：美B-2轰炸机绕路关岛骗了伊朗", "伊朗否认福尔多核设施再遭袭", "#美军为何选择此时轰炸伊核设施#", "专家解析美军为何用B-2轰炸机袭伊", "伊朗外长：谈判桌已炸毁怎能“重返”", "姚晨：LABUBU是人生唯一盈利的投资", "以军称摧毁伊朗两架F-5战斗机", "中国冥币在海外杀疯老外烧个不停", "以色列城市被炸 地标大楼窗户剥落", "伊朗外长召开新闻发布会谴责美军", "以军称对伊朗中部进行大规模空袭", "美国敦促在以公民快撤 “别等政府”", "林心如霍建华邱泽许玮甯聚会", "特朗普发表讲话：已彻底摧毁伊核设施", "常州烧烤店老板娘回应赞助苏超", "印度航空一航班因炸弹威胁紧急降落", "神秘人向华中科技大学捐1.8亿", "专家：美国针对伊朗后续如何部署"]

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
