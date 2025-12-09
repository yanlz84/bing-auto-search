// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.464
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
var default_search_words = ["中共中央召开党外人士座谈会", "日本又发生6.6级地震", "王毅：台湾地位已被“七重锁定”", "全国首艘氢电拖轮作业亮点多", "中国游客遇日本地震：连滚带爬躲厕所", "日本震中突发大火 民众开车逃命", "日本地震致多人受伤 超10万人需避难", "男子带老婆买糖葫芦被认成父女", "王毅：是可忍孰不可忍", "“人造太阳”何以照进现实", "日本警告后续或有更大地震", "网传“深金管318号函”系伪造", "高速公路上一车龟速占道引众怒", "经典版QQ宣布回归", "水银体温计将于2026年禁产", "英伟达获准对华出售H200芯片", "冲突第二日 泰柬动用重型武器", "银行网点正消失：今年超9000家关停", "在日华人亲历地震：雪天穿短袖跑下楼", "直击日本地震瞬间：摄像头剧烈晃动", "高铁商务座一擦全是黑印 12306回应", "熊猫宝宝聚餐横七竖八躺成一片", "留几手征婚要求女方是富婆", "日本地震当地居民拍下自家书柜倒塌", "日本附近海域发生7.5级地震", "美股三大指数集体收跌 特斯拉跌超3%", "亚洲最大“清道夫”落户中国洋浦港", "警惕！这种Wi-Fi不能连", "最高13万元一只！实验猴价格暴涨", "课本上明太祖画像换了", "日本自卫队战机紧急起飞越发频繁", "男子钓鱼偶遇“矜持”白鹭", "男子开保时捷跑顺风车 偷190块电瓶", "李现澳门街头摄影被路人警告", "日本多地已观测到30至40厘米海啸", "泰方称军事行动持续到主权不受威胁", "吃流感特效药别用矿泉水", "铜陵市广播电视台就名单造假致歉", "美乌会谈后特朗普或考虑退出", "孙磊大使：中方必须严正回应", "近3成美国人承认结账时“顺手牵羊”", "美国多名高官集体下场斥责欧盟", "梁文锋入选《自然》年度十大科学人物", "特斯拉机器人摔倒疑似“露馅”", "日本地震后一核设施乏燃料池水溢出", "护士患癌请病假遭拒？卫健委介入调查", "#中日军机之间发生了什么#", "女子自驾进猛兽区被老虎咬掉车漆", "以警方强闯联合国机构办公地升国旗", "杭州一小区业主抵制宠物医院", "夫妻俩用“塔罗牌占卜”骗270余万"]

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
