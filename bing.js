// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.22
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
var default_search_words = ["习近平总书记上海之行纪实", "中方正评估是否与美谈判关税", "日本再现无差别杀人", "AI再现劳模风采 这才是该追的星", "女子病假时看演唱会被辞退 法院判了", "山航三次备降延误超12小时", "上海多方回应女子擦鼻涕纸扔进碗罐", "华人钢铁大王遭撕票 儿子被甩锅主谋", "荣昌政府食堂米饭蒸了1000多斤", "这些声音见证他们的不平凡", "暗示女孩与老人关系不正当 网红道歉", "董某外公为外籍院士米耀荣？假", "南宁网红猩猩扔石块砸伤游客", "日本皇室生活费被内鬼偷了", "奥沙利文：赵心童被禁赛有点不公平", "男子帮抬棺猝死 家属获11万补偿", "《蛮好的人生》胡曼黎主动帮李奋斗", "侯佩岑能不能开个情商班", "特朗普让美国娃准备“为国牺牲”", "美前财长：美经济衰退可能性显著上升", "翁虹与丈夫分居3年感情反而更好了", "金价暴跌有人一夜亏47万", "斯瓦泰克罕见崩盘 连丢11局无缘卫冕", "杨鸣说系列赛辽宁没法抗衡广厦", "莫言回山东老家赶大集", "省委书记省长等集体观看警示片", "泽连斯基用一份协议警告特朗普普京", "广东小区天降洗衣机 物业：情感纠纷", "全世界游客都来重庆了", "特朗普承认关税战让货架空空", "高速连环车祸 白车将另一车压下面", "五四奖章名单有2位不能露脸的获奖者", "阿根廷发生5.6级地震", "辽篮近6年来首次无缘总决赛", "深圳新鹏城1比0天津津门虎", "美国：加拿大墨西哥汽车零部件免关税", "湖人1-4不敌森林狼结束季后赛征程", "布雷切尔：特鲁姆普是最好斯诺克球员", "五一小长假多地疯狂“抢游客”", "卫健委调查肖某董某 事件根本性升级", "库克：苹果今年将在美采购1900万芯片", "乌美矿产协议文本公布 明确乌收益", "38岁的韩德君自宣退役", "陈芋汐赛前训练5个跳水臂力动作", "抗癌女网红“小花”去世 年仅20岁", "美方主动与中方接触背后的秘密", "苹果公司CEO：无产品要涨价消息宣布", "中国冰壶混双世锦赛5:6负丹麦", "篮协回复北京男篮9处申诉", "北京气温下降 城区有弱降水", "瑞安航空：若波音涨价将考虑中国飞机"]

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
