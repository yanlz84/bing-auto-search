// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.265
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
var default_search_words = ["习主席与这些朋友聚首海河之滨", "伊朗最高领袖中文发文谈中伊关系", "国防科大接新生 自带千军万马气势", "听听天津人想说点儿嘛", "省长现场致敬退休副省长：非常了不起", "“子涵梓萱”时代已经过去了", "开学了 网警来送“网络安全课”", "00后男生0.6秒飞针采血惊呆患者", "大学生暑假工挣16000老板当场发工资", "地名里的抗战记忆", "男子租25亩耕地盗挖8400吨膨润土", "业内辟谣大额存款利息收20%个税", "普京下飞机 随行人员拎手提箱紧跟", "香港1200架无人机重现日本投降矣", "金价再上历史高位", "特朗普取消赴印参加峰会计划", "9月1日起骑“小电驴”要留意新规", "女孩考上医学院 未等到开学车祸去世", "埃尔多安戴墨镜步履轻松携夫人下机", "女童和老虎互动时被咬伤 家长报警", "陪看：樊振东德甲首秀", "香港演员黎宣去世 享年93岁", "兰州大学打地铺让新生家长免费住", "实习女店员跳河救人后提前转正", "小时候以为大人不爱零食是“装”的", "直击苏超：镇江vs南京", "男生花2万多游50多座城市：省得离谱", "演员宋轶发文回应整容争议", "新疆沙漠首次发现盐水丰年虾", "美国家情报总监公开一名卧底姓名", "中国女排无缘世锦赛八强", "花1.27亿给大山装扶梯行不行", "暴雨雷电冰雹 浙江连发71条预警", "许昕爆冷 赛后发文：回家", "冷空气来袭 北方陆续开启入秋进程", "直击乒超：王楚钦vs徐瑛彬", "香港警察被骗至柬埔寨诈骗园区", "古树砸扁宝马 林业局：车主也有错", "郭德纲否认偏心小儿子", "意大利女子游泳名将因偷窃被捕", "直击苏超：南通vs苏州", "金价大涨 背后有哪些因素", "美网球员送小孩帽子被百万富翁抢走", "乌前议长遭枪杀 俄方：另有内情", "42岁男星无戏可拍 工地当苦力养家", "收到北大通知书那天 他送了38单外卖", "女孩得“怪病” 上课就发烧到家就好", "土耳其总统人民日报撰文", "日本首相石破茂前往医院就诊", "峨眉山“陪爬”引争议 多方回应", "直击苏超：连云港vs扬州"]

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
