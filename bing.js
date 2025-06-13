// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.107
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
var default_search_words = ["习近平就印度客机失事致慰问电", "罗帅宇坠楼后其手机曾拨打过110", "以色列关闭所有驻外使馆", "几组数据透视中国外贸韧性", "卫健委：对违背医德医务人员严肃处理", "罗帅宇举报材料涉50多名器官捐献者", "网警公布3起涉高考网络谣言案", "比亚迪5月智驾车型销量夺冠", "湘雅二医院曾有患者出院当天死亡", "罗帅宇爸爸发声", "中国足协终止与国足主帅伊万合作", "你的真相被“剪”过吗", "罗帅宇生前聊天记录曝光", "罗帅宇死亡六大异常待解", "日本等国就以色列袭击伊朗表态", "罗帅宇妈妈：儿子坠亡与刘翔峰有关", "当当网创始人李国庆官宣离婚进展", "伊朗临时限制使用互联网", "伊朗退出与美国核谈判", "陈坤身材发福 胖到下颌线消失", "综艺导演陪你看《歌手2025》", "中方回应“以色列袭击伊朗”", "彻查罗帅宇事件才能平息公众疑虑", "女子因堵车逃过印度空难", "伊朗要求安理会召开紧急会", "以防长：打击伊朗因为已经无法回头", "深圳一河道惊现大量成扎钞票", "以色列为袭击伊朗已秘密筹备多年", "罗帅宇家属称从去年7月开始举报", "伊朗：将对以色列进行无止境报复", "6岁女童空腹吃荔枝触发“荔枝病”", "医生称印度坠机幸存者身体无大碍", "台风“蝴蝶”路径有变", "罗帅宇家属曾称后悔没做尸检", "萧旭岑回应马英九率团访陆被抹黑", "罗帅宇坠楼前曾给两人发短信", "演员郭晓婷为罗帅宇事件发声", "金正恩携女出席朝鲜驱逐舰下水仪式", "以总理证实对纳坦兹核设施实施打击", "台媒怒喷台当局接受美敲诈100亿美元", "湘雅医院提高补偿要求签署保密协议", "外交部回应印度客机失事", "以色列宣布关闭领空", "印度一家五口空难前留下最后自拍", "伊朗武装部队发布一号公告：报复", "伊朗“圣城”清真寺升起复仇红旗", "金晨赛车故障无缘比赛痛哭", "#伊朗会如何报复以色列#", "伊朗记者探访核科学家遇害现场", "湘雅二院想掩盖罗帅宇之死什么真相", "中方将支持伊朗封锁海峡？外交部回应"]

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
