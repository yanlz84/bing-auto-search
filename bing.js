// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.54
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
var default_search_words = ["习近平讲述文物里的文明交融", "空中无人机航母将首飞 可载百枚弹", "孙杨赛后久久不愿离去", "资本市场又一重磅新规落地", "成都春熙路巨型3D蛇太逼真引争议", "油价或将重回6元时代", "中国最难进的县城拖住了春天", "男子聚餐饮酒身亡 11人被索赔77万", "女子应聘文员被回复“太丑了”", "雅典上空现“巨鞋” 希腊下令彻查", "埃尔多安紧握马克龙中指不放", "2人传播涉刘国梁不实信息被处罚", "美国女子四度抗癌成功却意外被射杀", "女子洗澡时从香皂里洗出金币", "男子为赖账30万撕碎借条", "被举报猥亵男生教师自杀？北理工回应", "男子骑摩托车翘头摔倒险被货车碾压", "孙杨帮潘展乐贴好冠军号牌", "新疆多地现不明飞行物：和月亮一样亮", "女星230万耳环事件当以事实定真伪", "刘晓庆偷漏税举报人再发新证据", "驴友在野景点溺亡 同伴被索赔86万", "上海飞韩国一航班没降落连夜飞回国", "男子诈骗3千万转女友 自己节俭度日", "百度黄山音乐节开唱即巅峰", "朱时茂现身汪小菲婚礼 遇记者速逃离", "潘展乐终于游得比孙杨快了", "俞灏明王晓晨恋爱历程", "哈马斯拒绝将抵抗武器移交给巴方", "女子街头被戴手铐强制送上急救车", "王楚钦发球被判犯规 鹰眼挑战成功", "颜人中 夏夜最后的烟火", "特朗普：将分别与普京和泽连斯基通话", "谁建了潮汕1.14亿元天价违建", "汪小菲二婚誓词环节 连说2遍我愿意", "汪小菲两次结婚都刮大风", "夫妻被酒驾者撞死 孩子：以为是梦", "王皓：这或是近20年最困难的世乒赛", "广西水文站“倒刺扶手”已被拆除", "男子翻护栏插队被警察叔叔一把薅回", "气象部门回应新疆不明飞行物", "汪小菲马筱梅婚礼大合照", "王楚钦世乒赛开门红 4-0横扫对手", "中央气象台今日大风暴雨双预警齐发", "外交部驻港公署正告美政客", "网传林更新签约杨幂新公司", "孙颖莎赛前控制体重", "一瓶水赚2分钱的今麦郎困在低价里", "汪小菲马筱梅穿中式婚服热情打招呼", "《歌手2025》国际歌手“不灵了”吗", "汪小菲马筱梅婚纱照"]

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
