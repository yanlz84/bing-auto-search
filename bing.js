// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.213
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
var default_search_words = ["让人民过上幸福生活是头等大事", "公办幼儿园教师工资纳入财政保障", "许家印香港豪宅被曝违建挖地牢", "强降雨后返家 这件事一定要做", "国办：免除公办幼儿园学前1年保教费", "俄将不再维持《中导条约》自我限制", "北极圈遭遇热浪13天30℃ 医院爆满", "第五代DM亏电油耗刷新至2.6L", "英国“全面备战”了吗", "神似大S女生：意外走红很困扰", "于东来发视频称做手术已六天", "眼科专家破解青少年用眼八大流言", "缴纳社保不能自愿放弃", "受贿数额特别巨大 李鸿儒被提起公诉", "男孩报假警 奶奶得知后瞬间“暴走”", "宝妈晾衣服从16楼坠落后幸存", "女子例假后游泳大出血向场馆索赔", "演员李心艾官宣生女", "哪些人群可以免保育教育费", "小区给绿植撑伞防晒：数万元一棵", "孙楠瘦得不敢认了", "哈登中国人气惊呆外网", "三高老人被女婿爆改成腹肌大爷", "暴跌99% 印度吸金的故事讲不下去了", "专家：中国忠诚僚机将震撼美国人", "#二战中日本百姓是无辜的吗#", "非法收受6794万余元 李勇被判十四年", "官方回应“藏语文被移出西藏高考”", "《凡人修仙传》被吐槽感情戏令人不适", "来一次涨粉百万 海外网红扎堆中国行", "村民离婚因29只鸡怎么分闹上法庭", "女子水上闯关木头插入腿内 景区回应", "《浪浪山小妖怪》总票房破2亿", "巴基斯坦暴雨致302死727伤", "蜜雪冰城回应音乐节4元柠檬水卖15元", "检测发现榴莲肉样本的菌群数量爆表", "“中国科学院院士阮少平”被打假", "广岛纪念馆长：日本应正视加害历史", "司机取消订单耽误患者送医该担责吗", "许光汉将于明日退伍", "吧友神预言利物浦引援名单 火出国外", "中印都买俄油命运为何截然不同", "仅用3天10倍牛股变15倍牛股", "“中国第一将军县”县长调整", "列车断电停隧道1小时 12306回应", "民企状告地方政府索要4000万元", "媒体评别用奇葩名称“绕晕”患者", "记者调查：奶粉涨价与生育补贴无关", "律师谈无子女老人离世亲戚分割遗产", "81岁老人跳水救人：只记得自己是军人", "苏州脑瘫厂长带35个残疾员工创业"]

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
