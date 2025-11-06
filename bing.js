// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.398
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
var default_search_words = ["“大海”的底气", "巨型吊牌揭开线上女装高退货率痛点", "丈夫病亡两天后妻子也离世 妹妹发声", "别错过！十五运会金牌赛程来了", "大哥正钓鱼 30斤大鱼游过来要吃的", "超级月亮惊艳大图", "浙大食堂8.8元一只螃蟹引热议", "婚车被拦截索要50条烟 新人打车离去", "熬夜到什么程度？医生划出4条红线", "涉嫌严重违纪违法 柏林被查", "京津冀局地有强浓雾能见度不足200米", "海关罚没物品“内部处理”不实", "2025年全球最性感男人被选出", "冈村富夫当选捷克众议院主席", "中国航天器首次观测到星际天体", "专家解读为何春节放9天", "台风“海鸥”已致菲律宾114人死亡", "男子与堂哥合谋车祸撞死7岁儿子骗保", "美国货机坠毁事故遇难人数升至12人", "俄罗斯接连亮出“大杀器”", "汽车置换补贴券疑被同一人抢到93张", "美军试射洲际导弹", "李成钢会见美国农产品贸易代表团", "河南一公墓遭有组织冲击 3人被拘", "成都春熙路现巨型LOL冠军奖杯雕塑", "非洲狮“小毛”因情绪稳定火出圈", "气球无法穿过大气层但爱可以", "CNN让台当局破防", "“丽春”改名要什么精神证明", "9天超长春节刚宣布 机票预订量大涨", "中国模特首获亚洲模特盛典奖", "揭秘耽误航天员回家的“罪魁祸首”", "文印店处理机密文件埋泄密隐患", "醉驾男子车内酣睡 醒来发现在河中", "暴雪大暴雪要来了 多大的雪才算暴雪", "浙江省商务厅副厅长胡真舫拟升正厅", "新任干部炫耀公务员身份泄密被处分", "“1万乌军被包围”？俄乌各执一词", "王传君获东京电影节影帝", "战机编队昼夜鏖战 硬核训练照片曝光", "波黑将全国悼念养老院火灾遇难者", "丁俊晖2比6墨菲 无缘国锦赛8强", "邵佳一的岗位目标是进2030世界杯", "国台办发言人再“扩员” 台媒解读", "福建舰即将入列？三亚发布航行警告", "74岁深圳老人进入郊野径失联24小时", "甲型H3N2来袭 传染性是否更强", "郑村棋批沈伯洋干坏事捞钱", "台风“凤凰”今天生成 强度逐渐增强", "60秒直击今年最大“超级月亮”", "北京大部分地区能见度不足1公里"]

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
