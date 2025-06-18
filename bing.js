// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.116
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
var default_search_words = ["习近平出席第二届中国—中亚峰会", "特朗普呼吁伊朗无条件投降", "人民网评：禁违规吃喝不是吃喝都违规", "5月经济数据传递这些积极信号", "冲突外溢：胡塞将支援 白宫讨论参战", "男子实名举报李雪琴公司财务问题", "618 购物莫忘安全 网警守护你周全", "哈梅内伊：强力打击以色列 永不妥协", "在景区做帅哥NPC 一天“壁咚”300人", "各地夏粮丰收有“粮”方", "伊朗公布击落以色列F-35战机画面", "11号线发生爆炸？深圳地铁回应", "牛弹琴：伊朗必须做好最坏打算了", "伊朗宣称完全控制以色列领空", "美宣布驻以使领馆关闭3天", "伊朗：已准备领导人遇刺情况下的计划", "男子买迷奸药 被抓后称是给老婆用", "高以翔生前女友Bella举办婚礼", "特朗普警告伊朗声称“绝不留情”", "美股三大指数收跌 特斯拉跌近4%", "刘嘉玲晒和周星驰拥抱合影", "湖南临澧烟花厂爆炸事故搜救结束", "以军飞行员披露空袭伊朗幕后", "上任4天 伊朗最高军事指挥官被打死", "卫健委回应救护车转运800公里收2万8", "8岁男孩花1万多网购26箱荔枝", "伊朗袭击之际以色列人“苦中作乐”", "伊朗发生大规模网络中断", "云南检出一例全球罕见的小p血型", "海口通报孩童被关铁笼：自行爬入", "吃活金鱼喝食用油 这种吃播如何治理", "上海外滩美术馆就官号怼游客致歉", "伊朗：打击以色列的力度还将升级", "马英九一行在宁德参访", "阿尔卡拉斯2-0横扫沃尔顿", "中国学者提建议后 印度有人真的怕了", "飞天茅台电商促销价跌破1850元", "加印总理会谈 重启紧张的印加关系", "联大通过设反对单边强制措施国际日", "NBA球星在少林寺考取“少林一段”", "杨坤和美女同回酒店 疑新恋情曝光", "江苏一医院称负债4400多万全员解聘", "以军启用激光防空系统", "哈尔滨一网约车司机猥亵女乘客被拘", "伊朗发布识别通敌者指南", "外交部回应以军空袭伊朗国家电视台", "以色列暂停飞往其他国家航班", "伊朗对以色列启动第10阶段行动", "印尼一火山喷发灰柱高1万米", "纽约市审计长在访问移民法庭时被捕", "多地披露专项债券“清欠”进展"]

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
