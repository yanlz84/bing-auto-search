// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.63
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
var default_search_words = ["总书记的“待客茶”", "小米新品发布会 首款SUV亮相", "教育部拟同意设置32所新大学", "中国为什么还需要外资？", "武汉大学校门被淹一米深", "陈奕迅被传“去世”后首露面", "小孩用自喷漆将小区多辆车车牌喷黑", "白酒三巨头集体失守千元线", "女子白宫见特朗普 因一脸嫌弃而走红", "赵丽颖被曝恋情后首现身", "一级演员陈丽云被逮捕", "广西贪官家中发现大量金砖？假", "黄杨钿甜父亲被立案调查", "黄杨钿甜父亲涉故意隐瞒违法生二孩", "iPhone7Plus被苹果列为过时产品", "陈坤儿子大学毕业 父子俩合照庆祝", "疑妻子出轨自缢男子父亲去世", "华子在采访中说脏话被罚款5万美元", "歼-10CE登上中国展台C位", "潘展乐孙杨游泳冠军赛联手冲金", "90秒梳理黄杨钿甜“天价耳环”事件", "李嘉诚长子：有财务实力 顶得住风浪", "林志玲戛纳金色蝴蝶结抹胸造型", "雷军称小米芯片要对标苹果", "泰国前总理英拉被判赔偿100亿泰铢", "以军向外交使团鸣枪 有中国外交官", "男生偷拍女性当场被抓 已被开除学籍", "南非总统调侃特朗普：我可没飞机送你", "26岁女孩出门全副武装防晒致骨质疏松", "母亲改嫁回家养老 被儿子收房租", "男子躲深山7年“手搓”300辆车", "网传上海5000万豪宅明星认购名单", "比亚迪欧洲纯电销量首次击败特斯拉", "黄杨钿甜父亲涉违规经商办企业", "林高远：睡前原谅一切醒来便是重生", "袁隆平夫人在亲友搀扶下到墓园祭扫", "揭秘黄杨钿甜爸爸商业版图", "陈妍希一瘸一拐去酒吧与付辛博聚会", "#军舰下水都翻车朝鲜军工靠谱吗#", "朱媛媛患病后一直希望奇迹出现", "曝朱媛媛住院照医生疑删除动态", "天价耳环事件真是公众集体仇富吗", "特朗普当着南非总统面下令播放视频", "利率0字头时代 有闲钱还存不存", "网络树洞倾听者年赚3万多", "律师分析深圳地铁口打人男子责任", "贵州滑坡村民：姐夫被埋姐姐跑出来了", "中方回应菲方称科考船被水炮袭击", "朝鲜驱逐舰出事故 金正恩目睹全程", "与公职人员勾结 足疗店负责人被捕", "一盒助眠药从20元飙涨到100多元"]

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
