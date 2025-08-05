// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.212
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
var default_search_words = ["城市之变 中国之进", "奔驰女司机逆行逼停摩托 一旁是悬崖", "特朗普：将大幅提高对印度关税", "暴雨来袭牢记“10要10不要”", "女子吃桃子咬开发现里面一堆树叶", "赵露思直播意外带火面馆", "赵薇所持1590万元的股权再被冻结", "俄罗斯5架战机被“击中”", "印度“最隐秘伤疤”要被揭开了", "北京市解除暴雨红色预警", "上海一小区有人遛北美赤狐", "成都世运会招兼职需交保证金？假", "多个账号攻击爱国题材电影被禁言", "两中国人在柬遭杀害抛尸 中使馆发声", "亚裔美女嫁给1.2米印度裔丈夫", "白鹿凌晨遭私生打电话骚扰", "特朗普称已下令部署核潜艇 俄方回应", "警方通报奔驰女司机逼停摩托车", "90后银行职员夫妻下班送外卖解压", "岳云鹏发长文再谈演唱会争议", "许倬云曾经历抗战：中国不可能亡", "吴艳妮夺冠后向现场观众比心鞠躬", "赵露思控诉公司：不给看病 给我驱魔", "美股三大指数反弹 英伟达再创新高", "撞脸大S走红女生删除露脸视频", "干部8年未上班 镇政府：疑失联多年", "赵露思被甜品店合伙人背刺起诉", "河南持续高温 农户凌晨排队浇地", "吴艳妮全国田径锦标赛100米栏夺冠", "冲进海里救人的腹肌哥找到了", "以色列总理计划完全占领加沙", "奶粉纸尿裤涨价10元到60元不等", "一高校“千班万元”捐赠倡议引争议", "15岁少年疑被骗柬埔寨：打14万救我", "夫妻争吵后丈夫跳河身亡", "牛弹琴：印度发飙了", "人民日报谈互联网“黑话烂梗”泛滥", "赵露思：曾黎通过直播确认我状态", "白酒遇冷 集体降度", "13岁女孩骑电动车载人闯红灯被撞", "日本将展出《终战诏书》原件", "校方回应参观复旦大学需花98元", "林雨薇冲线时重重摔倒 身上擦伤明显", "赵露思否认整容", "立陶宛总统接受政府辞呈", "俄无人机打击乌战车：剧烈爆炸", "河南局地遇旱 土地干到铁锹挖不动", "深圳市发布暴雨红色预警信号", "红旗飞行汽车2029年将推出首款产品", "上海小伙喜中1047万福彩大奖", "多个省份省级地震局局长集中调整"]

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
