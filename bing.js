// ==UserScript==
// @name         Microsoft 
// @version      V3.1.6
// @description  自动完成微软Rewards每日搜索任务,每次运行时从百度实时热搜榜获取热门词,避免使用同样的搜索词被封号。
// @note         更新于 2025年2月27日
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @connect      gumengya.com
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
var pause_time = 9; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词
var appkey = "";//从https://www.gmya.net/api 网站申请的热门词接口APIKEY
var Hot_words_apis = "https://api.gmya.net/Api/";// 故梦热门词API接口网站


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["从这三个节点看习主席的东南亚之行","4名中国留学生把美政府告上法庭","与特朗普共面记者 她把脸挡了起来","越南大学生这样学中文","日本首相对特朗普关税发出强烈警告","男子卖出9年前买的金项链净赚近3万","江苏中1.09亿彩民已兑奖 缴税2197万","第一次见录一半全睡了的综艺","鸡蛋太贵 美国人用\"假蛋\"过复活节","美国关税大棒对中国效果到底会怎样","杨幂刘诗诗时隔16年再合作","四川某驾校教练车开上树？谣言","新华网：强换招牌 权力岂能如此任性","马斯克：将出现新方案实现自动驾驶","曝关晓彤先在朋友圈官宣与鹿晗恋情","西安一峪口贴警示牌\"两年失踪9人\"","多家银行下调存款利率迈向\"1时代\"","美团外卖计划向餐饮业投入1000亿元","夫妇遇害前叫醒熟睡两女儿躲过一劫","美国人开始飞中国代购中国制造","孙杨与你相约百度创作者大会","比特币ETF今日净流入197枚","张若昀主演的《风起大漠》删至75集","女孩与网友见面被强奸 嫌疑人被刑拘","央视曝光\"人人租\"","女子造谣与岳云鹏有私生女败诉","特朗普关税反复横跳有多\"颠\"","小心这些让你悄悄变胖的\"坑\"","古村落一街之隔有三种方言","连休9天 很多杭州人开始准备","宇树机器人充电姿势过于可爱","专家谈芯片企业并购潮","百岁老人撞车后与交警硬核对话","民警\"翻箱倒柜\"帮老人找回养老钱","中国连续16年为全球第二大进口国","三河绿招牌报告将由领导审定后发布","姜涛疑似发文回应王晶","成毅陈都灵邓为等火到马来西亚了","游客回程高铁上带了一大盆洛阳牡丹","29岁男演员退圈回老家赶集摆摊","台名嘴：美在中国周边打仗从未赢过","重庆一中学摆坝坝宴为高三学生减压","中交地产：2024年净亏损51.79亿元","湖南13岁少女遭网恋男友杀害","业内称房贷利率有望进一步下调","广州出现AI洗头","医生：闭目耗神与主动熬夜差别不大","景德镇车祸受害者家属住儿子婚房","日本大地震概率升至80% 中使馆提醒","哪吒汽车被曝已半年未交车"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
