// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.353
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
var default_search_words = ["习近平主席出席全球妇女峰会侧记", "金价这么高 到底谁在买", "大量iPhone17新机无法激活 苹果回应", "近万吨海上“巨无霸”怎么造", "“北方第一大省”赶上风口了", "中央音乐学院教授常平主动投案", "净网：网警带你看“网恋女友”杀熟局", "1064公斤！美国一男子夺冠种南瓜大赛", "王波受贿4.49亿余元被判死缓", "央行将开展6000亿元买断式逆回购", "万科原CEO祝九胜被采取刑事强制措施", "大雁塔玄奘铜像长满青苔系AI生成", "S15揭幕战：T1入围赛3比1淘汰iG", "特朗普指着阿联酋副总统：钱多得没边", "京东回应下场造车：不直接涉及制造", "解清帅举办婚礼一天后奶奶离世", "今年下半年来最强冷空气来袭", "非洲不足60万人口小国冲进世界杯", "再次起诉 大疆“硬刚”美国国防部", "美海军250周年庆祝海报用俄军舰P图", "特朗普抱怨美媒用他最差照片当封面", "刘亦菲C位力压影后 登沸点榜", "62岁“石榴姐”现身景区“打工”", "许传智涉嫌严重违纪违法被查", "宜居城市有了国家标准", "如何理解中方提打和谈的顺序", "牛市惊现五条腿的牛 牛贩：第一次见", "新台风“海神”要来了", "中方回应美对华造船等行业限制措施", "买机票被偷偷加钱 法院：退一赔三", "内蒙古呼伦贝尔一汽车与火车头相撞", "美国民众“勒紧裤腰带过日子”", "武汉国企掷6382.5万买沥青 官方调查", "一秒入冬 黑龙江漠河出现雾凇景观", "小区物业被解聘后带走162万公共收益", "#国考年龄松绑能打破35岁歧视吗#", "网民跟风用胖东来洗洁精洗头", "禁毒大队长被控走私毒品获刑三年半", "男子请假陪患癌父亲做手术被开除", "复旦教授偶遇“哲学老外”聊嗨了", "上海高中生赠非洲百套自制太阳能灶", "国乒女团3比0韩国 晋级决赛", "业主私挖地下室致楼房开裂 已被逮捕", "霸王茶姬回应顾客喝出瓶盖", "停火第二阶段会谈启动 以军袭击加沙", "日本执政党计划于21日召集临时国会", "美军肥胖照火遍全网", "中国突破模拟计算世纪难题", "孙颖莎3比1申裕斌", "广西一高校发钱补贴外卖丢失的同学", "游客质疑古城维护费套路 多方回应"]

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
