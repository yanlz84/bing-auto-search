// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.344
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
var default_search_words = ["习近平将出席全球妇女峰会开幕式", "李强会见金正恩", "国安部公布3名台独“水军”身份信息", "北方秋雨持续几天", "长假一群人带着绿豆游遍祖国", "苏翊鸣完成世界上第一个背靠背1980", "泰山陪爬者长假业绩：80人接200单", "干部收95只鸽子价值132万 最贵18万", "小伙回应免费为老人剪王嘉尔发型", "中医医保支付将进行改革试点", "以批准停火协议 哈马斯首度公开发声", "长期服用降压药血管会变脆系谣言", "上海一直热 植物都“内分泌失调”了", "日本一飞机穿越台风眼拍下震撼画面", "94岁爷爷早早站在路口送去世发小", "节后错峰出游的“大聪明们”赚到了", "全球首颗！中国研发全新架构闪存芯片", "爷爷卖菜攒3万 孙子放宝马车内被盗", "上海女学警“图图警官”火出圈", "多款产品突降价引不满 大疆回应", "母亲回应网传女儿高反被搭子抛弃", "一家三口被撞死案家属最新发声", "2名中国游客失联 中方敦促：争分夺秒", "5岁男孩在幼儿园被戳伤致左眼失明", "销售的烧鸡有七条鸡腿？商家回应", "德克士回应黑金藤椒小酥肉外形被吐槽", "网友改编神曲《没出息》火遍台湾", "内塔尼亚胡：相比美国 以不算心狠手辣", "中方：涉稀土管制已向有关国家作通报", "特朗普提议将西班牙“踢出”北约", "公益人胡雷捐物资走高速被收1180元", "雷佳音回应作品霸屏被观众厌烦：听劝", "湖南12名“吹哨人”获奖励", "孟加拉国临时政府计划买歼-10CE", "印民间不满美加税开启“法术攻击”", "寒露过后建议“洋葱穿衣法”", "乘客在机场阻止插队被扇耳光", "沙溢总结假期：八天成功吃胖十斤", "辽宁警方：穿拖鞋逃跑嫌疑人已被抓获", "耿爽联大发言提出12个反对", "当事乘客回应阻止插队被扇耳光", "男子路边停车休息遭野猴入车袭击", "南宁邕江大堤发生江水涌入险情", "洛阳一水库漂满垃圾 系饮用水源地", "一美容院把高频电灼仪称为黄金微针", "男子为给领导添堵向境外泄密", "乌军士兵“诱杀”俄落单士兵", "普京谈阿航客机失事事件", "美将派兵至以色列监督停火协议执行", "甘孜党岭女游客高反获救 仍在ICU", "比利时将全国罢工 中使馆提醒"]

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
