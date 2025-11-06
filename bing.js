// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.399
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
var default_search_words = ["高标准建设海南自由贸易港", "中国首例冷冻人8年后现状", "全运会陈芋汐掌敏洁夺冠 全红婵第5", "“乌镇时间”又如约而至", "1500年前悬空寺如何“挂”上悬崖", "苹果喊话iPhone13和14用户换新机", "菲律宾进入灾难状态 当地华人发声", "今日不宜上班？人民网批电子黄历", "福建舰即将入列！军事专家解读", "缅甸电诈之手伸向非洲", "俞敏洪发文确认孙东旭离职", "充劣质电致车辆自燃？造谣者被抓", "福建舰“航母五件套”已集齐", "#立冬必吃三样#", "给一个班发50万元奖学金？校方回应", "结婚登记增40.5万对", "山航空姐穿上羊毛衫制服了", "京津冀大气污染因何而起？专家分析", "女子70元卖7盒安眠药被判贩毒", "央视曝光AI假冒艺人直播", "专家回应康熙生父争议", "外企高管为啥爱上起中文名", "乌鲁木齐特大暴雪破纪录", "神舟二十号为什么被撞？权威解读", "罕见特大暴雪！大范围雨雪将影响多地", "演员王祖蓝 任高校教授", "中国提出：愿意帮助印度应对空气污染", "特朗普重申不会出席G20峰会", "打假AI温峥嵘不能只靠演员温峥嵘", "男生吐槽在校洗澡要先看广告", "外交部三连问日方", "多地给新婚夫妇“发红包”", "中方再回应安世半导体问题", "央视起底演唱会“内部票”骗局", "学生列队向老师车辆问好 校方回应", "拒绝强硬让座 年轻人厌烦了道德绑架", "立冬遇上小人国 迷你补冬萌趣十足", "这3个城市今年将冲击万亿GDP", "乌鲁木齐大雪压断树枝 仿佛进冰帘洞", "猥亵墨西哥女总统的男子已被捕", "外卖被拦 对方称校方唯一授权配送方", "卢秀燕今天两次90度鞠躬道歉", "百万一针的抗癌药有望首次纳入商保", "全运会还没开幕 为啥这些比赛比完了", "周大福一年关店近千家", "A股收评：沪指涨近1%重返4000点", "外交部回应菲澳日美防长联合声明", "大地磁暴要来了 会有哪些影响", "世界首座 铜陵长江三桥正式通车", "拦婚车索烟：打着讨喜名义疯狂敲竹杠", "商务部回应稀土出口管制措施"]

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
