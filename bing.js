// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.387
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
var default_search_words = ["习主席的韩国APEC时间", "习近平会见日本首相高市早苗", "中等发达国家水平什么样", "抓住“十五五”历史机遇", "黄仁勋与韩财阀吃饭高喊全场免单", "63岁儿子与94岁父亲一起居家养老", "网警侦破侵犯公民个人信息案", "网友称iPhone半夜自动拨号给陌生人", "顺丰回应男子曝寄劳力士不翼而飞", "10月全国各地经济社会发展观察", "30年不粘不锈钢锅复产预售60元", "云南一电站有人跳吊桥失踪系谣言", "湘潭大学投毒案罪犯被执行死刑", "于和伟捐了1200万片酬？多部门回应", "女子花45万装修翻车 邀市民打卡避坑", "大暴雪、特大暴雪要来了", "神二十一乘组出征仪式", "女子花29800元买“盐房” 商家回应", "理想汽车为车辆起火事件致歉", "成都情侣遛130斤大猪引围观", "AL 2-3不敌T1止步S15八强", "金价涨涨跌跌 旧首饰如何处理", "董军与美国国防部长会谈", "52岁极高龄女子成功诞下龙凤胎", "四川一地人社局办公电脑中毒", "演员甄志强去世 曾被誉为最帅展昭", "央视曝光盗版剧APP", "日本熊灾现场有明显吃人痕迹", "巴西9岁男孩捅死母亲", "新生儿转运时坠落骨折 相关人员停职", "李在镕出席活动感慨苹果手机多", "解放军位黄岩岛领海领空战备警巡", "荒野求生选手“冷美人”回应走红", "六大国家级新赛道 中部抢跑了", "2025南昌飞行大会超燃画面来了", "岗位变少报名人数变多 国考有多难", "被大陆立案调查后 沈伯洋慌不择路", "许绍雄11月18日出殡", "“超级月亮”又要来了", "工人掉百元现金 老板跑遍工地找人", "甘肃原副省长杨子兴一审获刑14年", "高校推广扁带运动 旋转跳跃身轻如燕", "居民家自来水有蓝色沉淀物 当地回应", "2栋厂房产业园吹成“百亿童车小镇”", "中方回应“美称中美协定或下周签署”", "错过再等1年！全国银杏观赏地图来了", "万物皆可拼 年轻人组局AA网红蛋糕", "读懂“卷尺哥”走红背后的逻辑", "苹果大中华区收入下滑", "男子开豪车盗窃 刚得手被老板秒夺回", "马库斯三人来到上海淞沪抗战纪念馆"]

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
