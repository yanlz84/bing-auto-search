// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.151
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
var default_search_words = ["这份发展战略彰显深沉而持久的力量", "电子垃圾三件套捞了中国男人几百亿", "日本末日预言者开始改口", "高温天气这几件事不宜做", "苏超焦点战：徐州vs南通", "郑州一五星级酒店摆地摊日入3万", "央视主持人龙洋有新身份", "73岁朱琳一开口就是女王陛下味", "19岁女生遭侵犯溺亡 凶手被执行死刑", "湖南游船侧翻29人落水 已救出28人", "交警回应17052km/h“超音速”罚单", "院士预测广东将有8级以上地震？假", "关键位置多次地震 日本政府紧急回应", "高校宿舍没空调 学生热晕送医", "南京运一万块冰块为观众和球员降温", "武汉已经热到鸟都中暑了", "列车脱轨小伙砸窗通风 铁路通报", "21岁机车少年因意外车祸离世", "23名死亡人员领高龄津贴 官方通报", "直击苏超：扬州vs无锡", "知名女演员自曝曾患精神疾病", "鹿晗全平台账号解封", "台风“丹娜丝”或在闽浙沿海登陆", "警方回应采耳店女技师遭猥亵", "女演员巨缘圣因病去世 最后动态曝光", "超20万人熬夜看日本地震监测直播", "最大不明物体正朝地球飞来 12月经过", "美国近1200万人将失去医保", "美国“独立日” 马斯克“闹独立”", "鹿晗账号20分钟涨粉过万", "前台开错房涉事女房客男友发声", "演员王梓薇买别墅了", "吴艳妮“暴击流穿搭”火出圈", "美得州洪灾致约20名儿童失踪", "列车应急预案是否缺乏动态调整机制", "特朗普签署“大而美”法案", "疑似横店短剧演员去世", "公司招聘拒录E人 求职先做550道测试", "杨幂摔出了神图", "上海将剩面二次销售饭店被立案调查", "“黄金平替”卖爆了 涨幅超过黄金", "台风“丹娜丝”90度拐弯", "香港市民登山东舰排队体验枪械", "成都暴雨划船哥是赶去上班的托尼", "日本大地震预言时间点已过：没震", "小米回应车规级纸巾盒", "卫健委：请大家不要轻信“网红医生”", "开拓者官宣夏联名单：杨瀚森压轴", "柬埔寨宣布与美国达成关税协议", "今日有毁灭性大地震？日本政府回应", "苏超卷到啦啦队上了"]

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
