// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.108
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
var default_search_words = ["习近平：中国—中亚合作大有可为", "伊朗报复以色列 密集发射上百枚导弹", "官方通报“罗帅宇坠楼事件”", "外贸品转内销 如何卖得好", "伊军高层被骗聚集开会 司令等被炸死", "伊万凌晨离开中国飞往卡塔尔", "泡泡玛特摆件被保洁员当废品丢弃", "85岁妻子没上进心93岁男子起诉离婚", "哈梅内伊：将彻底摧毁以色列政权", "章子怡压轴亮相红毯 气场强大", "伊朗爆发全国性示威：“以色列去死”", "你的真相被“剪”过吗", "警方认定罗帅宇系跳楼自杀身亡", "《歌手》第五期排名公布", "台风“蝴蝶”在海南省登陆", "伊朗导弹击中特拉维夫一核研究中心", "曾毅回应手表被指含性暗示元素", "女孩因基因突变眼睛变蓝色 妈妈发声", "GAI《歌手》第五期排名第一", "以色列：已击中伊朗超过200个目标", "谢苗送李连杰的礼物是剧中内裤", "以军：已识别伊朗向以色列发射的导弹", "至少20名伊朗高级指挥官丧生", "以军称袭击了伊斯法罕附近核设施", "德防长否认向乌提供“金牛座”导弹", "女子被捅20余刀胸部假体救了一命", "伊朗导弹已致以色列1死50伤", "以色列为袭击伊朗已秘密筹备多年", "郑钦文2-0拉杜卡努 首进草地赛四强", "伊朗称对以实施“毁灭性精确打击”", "巨大伊朗导弹残骸现以色列街头", "金正恩视察朝鲜重要军工企业", "给在建世界第一高桥装空中跑道", "医生诊疗时电话唠家常患者在一旁等", "“蝴蝶”台风雨将波及超七个省区", "女生用高压锅煮粥 关火瞬间炸了", "罗帅宇爸爸发声", "伊朗军方称击落两架以军战机", "永辉超市调改门店突破100家", "以总理：已摧毁大量伊导弹和核设施", "当地回应女孩暑假打工被血站抽血浆", "苏超十三太保从球场卷到天上", "曝杜兰特下家缩减火箭和森林狼", "普京分别与伊朗以色列领导人通电话", "苏宁易购与上海海绥文达成债务和解", "罗帅宇坠楼后手机拨打110为民警拨出", "伊称向以发射“大量”导弹", "特朗普谈以色列对伊朗袭击：十分出色", "苏超大战已经打到车上了", "中东多国谴责以色列袭击伊朗", "涉嫌严重违纪违法 李玉琼被查"]

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
