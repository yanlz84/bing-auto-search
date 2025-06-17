// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.114
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
var default_search_words = ["“共同迎接六国更加美好的明天”", "伊朗称再次击落F-35战机", "歌曲《李白》改编引争议 人民日报发声", "中国高铁又快又稳的秘密", "电视台遭袭前 伊朗女主播仍痛斥以军", "伊朗记者手带血直播 身后电视台起火", "特朗普：将暂缓对俄罗斯实施制裁", "TVB女演员黄凤琼转行做月嫂", "热播剧男演员接戏困难兼职泰山陪爬", "这届年轻人为什么爱非遗", "埃及约旦等21国谴责以色列袭击伊朗", "山西一学生被光伏板砸中身亡？假", "台风蝴蝶致三亚榴莲掉满地", "警方通报村民“哄抢”上百亩土豆", "伊拉克民众为伊朗打击以色列叫好", "女儿实名举报交警继父私生活混乱", "8岁失去妈妈的男孩29岁捐髓救人", "印度亿万富翁误吞蜜蜂身亡", "以袭击致伊电视台一名员工死亡", "曝某艺人参加综艺录制迟到12小时", "《酱园弄》赵丽颖杨幂台词双双被吐槽", "以色列偷运武器进伊朗细节曝光", "伊朗称已准备长期全面战争", "特朗普：俄应回到G8 中国也可加入", "伊以互袭大战究竟谁会先撑不住", "排球世界成员：中国男排将会重返奥运", "企业年金近三年累计收益率首次出炉", "伊朗：严惩通敌者", "伊朗处决一受雇于以色列的间谍", "医生联系民营救护车 800公里收2.8万", "美国“尼米兹”号航母改道驶向中东", "伊朗和以色列 谁能熬到最后", "福建舰下水3周年 3航母同框指日可待", "车手叶一飞夺冠后发文", "伊朗警告特拉维夫居民撤离", "使馆提醒在以中国公民尽快陆路离境", "尹锡悦出庭受审后对记者说别挡路", "“苏超”商业价值飞涨", "男子误将502滴入右眼烧伤眼角膜", "造车界也开始出现“预制菜”了", "罗马仕宣布召回超49万台充电宝", "曾舜晞梁永棋去探班白鹿了", "男子看凤凰传奇演唱会突收失业通知", "切尔西2-0洛杉矶FC取得世俱杯开门红", "海南多名赤裸幼童被父亲关车斗铁笼", "以军对伊朗中部开始新一轮空袭", "越南取消计划生育 释放什么信号", "以色列：将发动比前几天更猛烈袭击", "巴黎航展多家以防务企业展台被关闭", "C罗赠送特朗普签名球衣", "于正回应《临江仙》热度破万"]

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
