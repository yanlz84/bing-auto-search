// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.383
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
var default_search_words = ["携手开创亚太发展新时代", "习近平将同美国总统特朗普举行会晤", "世界第1！中国IPv6活跃用户达8.65亿", "关注“十五五”这些新提法新举措", "你种菜的“营养土”可能有毒", "暴雨！大暴雪！新一股冷空气将来袭", "网警大字提醒：护老安全莫松懈", "一种比三高还猛的病正在困扰咱爸妈", "特朗普：未能协调好与金正恩会晤时间", "中国花滑选手因玩偶遭国际滑联调查", "百岁老人爱喝咖啡奶茶玩坏3个iPad", "广东一货车装“过亿现金”系谣言", "落马女副厅被逮捕 外号“田哥艳姐”", "上海一公司董事长离世 年仅46岁", "孤寡老人去世欠贷66万 民政局清偿", "飓风“梅丽莎”风眼震撼画面", "直击星际访客3I/ATLAS", "34岁妈妈满头白发亲吻去世宝宝墓碑", "这群年轻人为什么老在田里数虫子？", "受贿1.47亿余元 杨发森被判无期", "总台重阳特别节目", "色弱学生被退学：应查明高考体检结果", "中国女数学家王虹接连斩获两项大奖", "“梅丽莎”逼近 多艘美军舰艇躲避", "2025年大学生月均生活费1744元", "2个弟弟送姐姐出嫁 吃分家饭时憋笑", "人老了真的会变傻吗", "立青农布、立青定主 1个月内双双被查", "宝宝巴士里不该有低俗广告身影", "82岁影帝许冠文一年获2个博士学位", "年轻人脑卒中发病率逐步增加", "万吨大驱连射新型导弹", "13个省份进一步提高基础养老金标准", "穿不了高领衣服原来是一种病", "北大医药董事长徐晰人被刑事拘留", "今日重阳", "韩国会议员开会时专心画大猩猩", "KT战胜CFO", "生活噪音将归公安管 最高10日拘留", "中国兽协回应动物血库抽取猫血", "神秘天体10月29日抵达近日点", "多款儿童类APP出现擦边广告", "餐馆制度引争议：24条有18条扣员工钱", "韩国奥委会主席柳承敏被查", "中小学生竞赛活动“白名单”公布", "苏丹西部医院遭袭 逾460名患者遇害", "韩美总统会晤 讨论巩固同盟关系", "今年是百年一遇的“晚重阳”", "机器人开始打辩论了", "飓风猎人飞向“梅丽莎”时遭强对流", "多系统助力神舟二十一号顺利飞天"]

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
