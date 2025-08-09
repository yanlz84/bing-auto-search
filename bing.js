// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.220
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
var default_search_words = ["习近平同普京通电话", "甘肃发布会全体起立向遇难者默哀", "中国移动称携号转网已成恶性竞争", "带你了解免费学前教育政策", "尊湃芯片窃密：有人白天华为晚上尊湃", "《南京照相馆》北美首映 美国观众共鸣", "特朗普将于15日在阿拉斯加会见普京", "男子转嫖娼对象138万 原配追讨败诉", "凌晨给未成年抽血 卫健局：情况紧急", "《歌手2025》歌王陈楚生", "中国留学生遭群殴致重伤 中使馆提醒", "“安徽假尼姑王欢”贴文系编造", "两个“被美国羞辱最重”的大国行动了", "走5公里和跑5公里哪个更健康", "疑因孩子顶座冲突 女生被一家人围殴", "特朗普征100%关税 菲律宾叫苦", "特朗普：美俄已非常接近达成协议", "郑州水警驾驶“神器”登场救援", "美股全线收涨 纳指创收盘历史新高", "证监会开出1.6亿元巨额罚单", "单依纯露背造型好大胆", "24小时退房制为啥不能成统一标准", "翼装飞行博主撞上岩壁身亡 好友发声", "以军参谋长：将以最佳方式接管加沙城", "狗狗叼回了一只豹猫幼崽", "石破茂和莫迪强硬回应特朗普", "心跳1分钟多少次最健康", "单依纯：我不知道什么叫错", "阿根廷队10月中国行取消", "加拿大一黑熊偷吃狗粮被博美犬逼退", "杀害中国籍农场主的赞比亚男子身亡", "牛弹琴：普京有大动作", "运油车侧翻 大量村民提壶“捡油”", "疑似歌王名单提前泄露引争议", "美媒称内塔尼亚胡被特朗普大声斥责", "物业回应两小孩爬到阳台外玩耍", "南京博物院高峰期将男厕改女厕获赞", "极端高温影响全球大量人口", "巴勒斯坦各方谴责以接管加沙城决定", "医生用脚趾再造手指3天后能屈伸", "陈楚生参加《歌手》后吃安眠药入睡", "中国男子赴柬遇害：跳车逃网赌园身亡", "因评论被拘5天男子主张9.8万抚慰金", "甘肃省级文保单位兴隆山卧桥被冲毁", "埃及交通事故已致9死44伤", "#直击甘肃榆中山洪受灾现场#", "演员张翰因合同纠纷被起诉", "网友吐槽《歌手》有自己的耀祖", "WTT横滨冠军赛8月9日赛程", "甘肃地质灾害防御响应等级升为Ⅱ级", "甘肃榆中县本轮强降水有3个特点"]

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
