// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.359
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
var default_search_words = ["非凡“十四五”", "服装巨头堕崖身亡 长子成头号嫌疑人", "日本人开始抢金条了", "一组数据看我国科技跑出新成绩", "中国人为啥越来越高了", "广西天空现串珠状不明飞行物", "男子偷上万辆共享单车 每辆卖105元", "杨力维杨舒予父亲去世", "施一公谈杨振宁逝世传闻：别以讹传讹", "被通缉的韩国财阀千金疑成电诈大佬", "尾号66666666手机号拍出275万", "新疆于田有30万亩荒地出租系谣言", "何卫东苗华等9人被开除党籍军籍", "70后夫妻在非洲卖纸尿裤年入32亿", "成都警方通报51岁女子撞车致6伤", "大脑功能或60岁时达巅峰", "江西小伙回应彩礼视频爆火", "金价暴涨有新人用“金包银”省5万", "杨瀚森回应场边哭泣", "鸡蛋不论贵贱基础营养差别不大", "中方回应石破茂向靖国神社献祭品", "缅北小黑屋密密麻麻的正字", "甲骨文天气预报被打脸 祖宗级吐槽", "初雪至 北大荒上演“黑白画映”", "中南大学原校长张尧学被查", "电诈园区小黑屋墙上沾满血手印", "越来越好玩的河南做对了什么", "成达万高铁8500吨大桥空中精准转身", "高校保安打死进入餐厅流浪狗被开除", "外交部回应俄新社记者遇袭身亡", "女子诈骗2600万被捕3年7次怀孕", "找到走失4岁女童后派出所所长哭了", "假期去工厂“打螺丝”越来越难抢", "与特朗普通话后 普京立即召集会议", "操场对一个农村小学意味着什么", "摄影店用粉蓝相框暗示胎儿性别被罚", "家禽店老板多器官衰竭 确诊鹦鹉热", "市场鬼秤扎堆 6个摊位都缺斤少两", "在这13个国家工作可免缴当地社保", "金价暴涨时 4万5黄金订单蒸发", "金价涨了 金条能变现吗", "妹妹被噎 哥哥迅速海姆立克急救", "广西一国企负责人被指婚内出轨", "台湾少年失踪10小时不到陈尸铁轨", "外国老丈人向发小炫耀中国汽车", "墨墨背单词App助记内容被指低俗", "日本部分金店暂停销售小克重黄金", "公司设置每日固定饮水时间每次5分钟", "昆明“理发摊一条街”火了", "委内瑞拉总统马杜罗喊话美国人民", "猴哥闯进小区上演飞檐走壁 被劝降"]

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
