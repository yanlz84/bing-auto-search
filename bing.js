// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.139
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
var default_search_words = ["“努力为党和人民争取更大光荣”", "残疾小伙捐19吨物资 账户剩5毛钱", "曝日本计划征收“单身税”", "花样新“夜”态点燃夏日文旅新引擎", "女孩做黑医美一针晕厥全身发黑", "直击苏超赛场：苏州vs扬州", "继母捂住亲妈眼睛不看脑瘤男孩剃头", "以色列再爆发大规模抗议", "男生高考672分农贸市场奖10万", "苏超最快进球诞生", "马斯克痛批特朗普“大而美”法案", "2人造谣科研人员虐待大熊猫获刑", "歼-16霸气驱离外机 全程影像公布", "直击苏超：泰州vs徐州", "前台借伞砸人男子被拘", "直击苏超：南通vs宿迁", "黄旭华院士今日在广东家乡安葬", "#暴雨再袭榕江灾区现场直击#", "父亲背了12年的肌无力少年高考624分", "平台回应游客冰岛租车遭天价索赔", "油价或迎年内最大涨幅 一箱多花25元", "乌军称一架F-16坠毁 飞行员身亡", "“人类饲料”上线72小时狂销2.4万份", "陈建斌：不想在蒋勤勤面前落泪", "鹿晗演唱会直拍", "成都的雨下到了全国第一", "河南大哥扛6000份烩面驰援榕江灾区", "李一桐吐槽和戚薇穿成西红柿炒鸡蛋", "媒评环海南岛摩旅被民警私家车逼停", "李雪琴怎么美成这样了", "乌官员：俄对乌发动最大规模空袭", "黄旭华墓碑上方三行字令人动容", "女子被洪水冲进地库 靠游泳逃生", "交警开私家车高速逼停摩托？当地通报", "李兰迪刮彩票以为中了7万", "伊朗被曝曾几乎成功刺杀蓬佩奥", "伊朗逮捕700多内鬼 查获万架无人机", "榕江终止防汛Ⅰ级应急响应", "苏州千架无人机助威苏超 排面拉满", "乌称击落拦截大量无人机和导弹", "南通送苏超球迷人手一份伴手礼", "杨瀚森在开拓者的第一天", "宋佳致获奖词 网友：今年最好", "“苏超的氛围已经吹到了宝岛台湾”", "美国一直升机从上空抛撒大量美元", "以色列被曝15年前开始筹划打击伊朗", "蔡澜遗产如何分配？助理发文回应", "别把“1岁工作22岁退休”当笑话看", "以色列“随时打击”会成中东常态吗", "塞尔维亚首都爆发大规模抗议", "南京可口可乐博物馆60岁以上禁入"]

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
