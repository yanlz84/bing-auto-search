// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.175
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
var default_search_words = ["有些事要打攻坚战 有些事要久久为功", "银行卡负600万的农民：工钱都花不了", "为什么现在没什么人吃口香糖了", "高温天气下如何识别和预防高温病", "印度第七次申请入常失败？真相来了", "6名员工半年用AI实现财富自由", "某科技公司未落实网安保护义务被罚", "59.9元一罐的空气发布后被抢空", "乐山大佛热到休假了", "葛优不知道喜羊羊是什么", "网红老板西藏自驾游途中去世", "12306能在线换座？官方解答", "爱康国宾因检测不准被多次投诉", "体检10年无异常确诊癌症 爱康再回应", "大鹏和杨幂讨论要不要“二胎”", "宗庆后背后女人成遗产纠纷关键人物", "体检10年未提示风险 查出癌症晚期", "哈梅内伊：有能力对美实施更沉重打击", "#你的城市热到多少度了#", "游客逗牛反被牛群踩踏 管委会回应", "韩红称未来可能会过得很清贫", "游客逗牛遭围攻踩踏：喂牛肉干敲屁股", "董璇婚宴和佟丽娅合照", "以色列空袭叙利亚 中方表态", "国企登报喊61名职工回来上班", "男婴去世赔偿款律师拿55万 律协通报", "中央第九巡视组已进驻山东", "毕业即月薪过万的本科生不足10%", "酷似林依晨女孩回应被心仪大学录取", "印航机长关闭燃油开关或直接导致坠机", "以对叙首都空袭 叙利亚领导人发声", "县委书记授意挪用1400万校园餐资金", "美国7.3级强震：当地居民情绪恐慌", "马丽幽默模仿姜文口吻夸自己", "以空袭叙“总统府”区域 外交部回应", "儿子高考不理想 父亲让他学碳弧气刨", "中联重科回应工装男子别停摩托车", "爱康国宾CEO曾爆行业造假：抽血倒掉", "第一次知道警犬技术专业会发小狗", "杨幂主动让C位", "游客进入丽江古城要交钱了", "13位央视老主持人团建 全是童年回忆", "牛郎织女雕塑核定结算造价为207万", "健康体检能否筛出肾脏癌症 专家回应", "老人狂喝水一天6升致水中毒", "网红涉嫌诈骗 自称覃海洋未婚妻", "挖煤小伙回应逆袭成北工大博士", "风口上的团播运镜师：3天速成月薪2万", "男子每天5杯奶茶喝成三高和痛风", "涉“铅超标” 维态美公司被立案调查", "警察称能从缅甸捞人 骗取18万后被抓"]

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
