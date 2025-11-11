// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.409
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
var default_search_words = ["感受总书记对体育健儿的殷殷关切", "从7元涨到40元 奶皮子一天一个价", "鸠山由纪夫：日本不应干涉中国内政", "全运会火炬为什么在水里传递", "“最丑建筑”铜钱大厦拍卖 无人报名", "员工第一天上班失手摔了18筐鸡蛋", "覃海洋夺全运会男子100米蛙泳金牌", "霍震霆现场才知道郭晶晶是火炬手", "酒店提供小狮子叫醒服务 628元一晚", "梁靖崑爆冷出局 止步全运会男单32强", "张雨霏摘得全运会女子100米蝶泳金牌", "“陕西咸阳千亩辣椒免费摘”不实", "俄方宣布：准备向印度转让核技术", "张颂文救助车祸市民获赠锦旗", "苹果推出新配件：1299元买“一块布”", "中方就菲律宾遭受台风灾害提供援助", "胖东来招聘中英翻译助理 年薪超50万", "暴走团现身香港 音乐打扰其他游客", "外交部回应欧盟或剔除华为中兴设备", "双11你买的食品安全吗？抽检结果公布", "柴怼怼等被判赔偿胖东来200万元", "特朗普威胁起诉BBC 索赔10亿美元", "四川阿坝红旗特大桥发生垮塌", "苏州警方通报“骑警撞倒3名观众”", "首次发现！极危植物“红头索”长这样", "外交部：对仲代达矢逝世表示哀悼", "歼-20战机发射导弹气场拉满", "夏威夷火山喷发 出现“火龙卷”奇观", "北京警方刑拘1名“掏蛋男”", "王楚钦“着急收工”：你的问题太多了", "2025年中国金鸡百花电影节今日开幕", "为啥医院椅子有的密密麻麻带小孔", "林诗栋4比0战胜孙闻 锁定男单16强", "吉林一头野猪在校园狂奔被警方击毙", "非全日制博士总学费78万算不算天价", "男子在苏州河放生外来入侵物种牛蛙", "日本今年为何频繁“熊出没”", "四川爆冷出局！浙江杀入全运男篮决赛", "黄金到底还能不能买", "“大湾鸡”漏气被迫下班", "全运会“大湾鸡”表演倒立超可爱", "博物馆推出“蟑螂咖啡” 45元一杯", "主打极致反差的云南BIGBANG火了", "跳水“冠军摇篮”为何是湛江？", "巴基斯坦汽车爆炸事故已致5死", "跨境网赌头目佘智江将被引渡回中国", "Faker认领LOL第一人", "福建莆田12岁女孩被虐死案二审宣判", "河北美甲师“撞脸”成毅走红", "王长浩夺全运会男子50米蝶泳冠军", "王曼昱4-3险胜范思琦"]

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
