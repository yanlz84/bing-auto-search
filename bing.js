// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.404
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
var default_search_words = ["看习近平心系南粤大地", "一群世界冠军争一个全国冠军", "120万一针的抗癌针有效吗？医生解读", "全运热潮席卷粤港澳三地", "宇树机器人被飞踹后仍能快速起身", "中国人连睡觉都有浪漫感", "张家界荒野求生选手抓野猪吃到流油", "全运会跳水选手失误差点摔出水池", "35元一个的面包在四线小城杀疯了", "退休人员为让孩子留学给间谍送绝密", "今晚开幕！十五运会这些看点值得关注", "当地辟谣饭店老板患艾滋病仍经营", "今天是全国消防日 致敬消防英雄", "加拿大总理：我们和美国结束了", "这些照片千万别发在朋友圈", "2025福布斯中国内地富豪榜发布", "大雾预警升级为橙色！多地有特强浓雾", "中国最大页岩油基地累产超2000万吨", "杭州对淘宝“霸屏广告”展开调查", "牛肉面馆一碗“管饱面”全网爆火", "这些错误护肤方式你可能每天都在做", "法国男子在自家花园挖出70万欧元黄金", "“全网最像夫妻”回应被建议测DNA", "衣服吊牌和A4纸一样大了", "90岁奶奶分享长寿秘诀：每天吃洋葱", "男子帮邻居关液化气瓶遇爆炸去世", "华为将发布新款手表 售价6499元起", "《繁花》剧组回应王家卫录音争议", "郑丽文祭拜吴石将军 鞠躬献花", "俄罗斯对乌克兰发动大规模空袭", "专家谈康熙身世：很多网传说法不靠谱", "广西男子自制“炮米花”", "12306购票“价格最低”有多低", "成都AG超玩会夺KPL年度总冠军", "男子每天下班弹弓打鸟 涉刑事犯罪", "广电总局：治理不良动画微短剧短视频", "美国佛州发生交通事故 已致4死11伤", "台风“凤凰”要来了 沿海风雨渐起", "全运会开幕式演出阵容公布", "六万人在鸟巢观战KPL年度总决赛", "正直播NBA：独行侠vs奇才", "纽约用带盖垃圾桶 市长：革命性创意", "胡塞武装称打掉美以沙三方间谍网络", "“航母事业对我来说永远无怨无悔”", "德约科维奇夺生涯第101冠", "中方同意荷方派员来华磋商的请求", "中国6G专利申请量全球第一", "沉浸式体验武警官兵实爆现场", "远程手术离“实用”还有多远", "石破茂谈卸任首相：能随时去吃拉面", "郑丽文祭拜现场 民众高喊：都是中国人"]

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
