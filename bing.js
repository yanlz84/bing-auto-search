// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.53
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
var default_search_words = ["传承文明 照鉴未来", "央视披露：歼-10CE实战击落多架战机", "潘展乐战胜孙杨 400米自由泳夺冠", "6组数据透视中国市场强大吸引力", "夫妻被酒驾者撞死 孩子：以为是梦", "新疆多地现不明飞行物：和月亮一样亮", "国家网络身份认证App保护信息安全", "百度黄山音乐节高能开唱", "38岁女工靠扛楼还债50多万", "特朗普：想访问中国", "“跳楼机”红了 华语乐坛黄了", "2人传播涉刘国梁不实信息被处罚", "新冠阳性率上升 专家：病毒还在变异", "希林娜依高话筒磕到了嘴", "菲中期选举揭晓 杜特尔特家族归来", "美国拟制定100万巴勒斯坦人迁移计划", "广厦vs北京总决赛G5前瞻", "“对华贸易要比对美贸易重要10倍”", "汪小菲马筱梅婚纱照", "93年女子嫁65年丈夫：崇拜老公", "汪小菲撒喜糖 张兰一身红衣送祝福", "下周A股解禁市值逾300亿元", "俄方：普京和泽连斯基有会晤可能", "孟子义被曝整容带资进组 工作室回应", "“蔷薇女孩”墙绘因影响交通被涂白", "朱时茂现身汪小菲婚礼 遇记者速逃离", "尹锡悦宣布退出国民力量党", "2天45名巴勒斯坦儿童被以军杀害", "上海地铁回应老人拖拽小伙要求让座", "王楚钦谈世乒赛压力大避免输外战", "曝大S子女未出席汪小菲婚礼", "尼克斯时隔25年重返东决", "男子被演唱会躺票震惊", "女星230万耳环事件当以事实定真伪", "高铁启动女乘客突然冲出被门夹住", "汪小菲两次结婚都刮大风", "美国公布第六代战机更多细节", "汪小菲马筱梅婚礼大合照", "孙颖莎迎多哈世乒赛开门红", "俄乌伊斯坦布尔谈判的分歧点是什么", "2025黄山音乐节来了", "苏敏阿姨走到了戛纳红毯", "张朝阳14年后再次参加汪小菲婚礼", "小罗踩单车加牛尾巴过人引对手膜拜", "张兰带亲家为儿女祈福", "中国减持美债 持仓规模降至第三", "当地通报潮汕豪宅英之园将强拆", "研究表明过度疲劳会改变大脑结构", "阿尔巴尼亚总理单膝跪迎接意总理", "15岁小将戴潘展乐泳帽", "林志炫回应妆造像鹦鹉"]

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
