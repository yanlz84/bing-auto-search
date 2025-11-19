// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.424
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
var default_search_words = ["指引法治中国建设 总书记这样阐述", "中日最新交锋 没有握手", "高市早苗毒化中日关系必将自食恶果", "全运会百米冠军首次属于“00后”", "中方：日本没资格当安理会常任理事国", "“冷美人”首次哽咽回应质疑", "李强会见俄罗斯总统普京", "今天日本必须决定：是否要自取灭亡", "日本拿出诚意再来", "外交部回应德国政府涉台海言论", "国安机关近年来破获一批日本间谍案", "“南京地铁要通到无锡”系谣言", "印度大学保安将脚伸进食堂米锅搅动", "南部战区硬核视频：敌人你们都别太狂", "49.1万张飞日本机票被取消", "美股科技股遭抛售 英伟达跌近3%", "起底高市早苗黑历史", "终于看见荒野求生林北真面目", "中方回应中日官员磋商：当然不满意！", "亚马逊市值一夜蒸发超7800亿元", "四川舰“常务副航母”？还是低估了", "中方说了三个绝不允许", "中方穿五四青年服见日本官员", "首批“月壤砖”返回地球", "美参院批准强制公开爱泼斯坦案文件", "研究生上门教骑自行车一次收几百块", "矢野浩二发文：永远支持一个中国", "日媒曝高市早苗“拜鬼”计划", "四川古蔺惊现“恐龙王国”", "海南封关运作准备就绪", "正直播NBA：凯尔特人vs篮网", "于东来不再兼任胖东来总经理", "物业通知将投毒治理遛狗不清粪便", "女子被未拴宠物狗绊倒 已做开颅手术", "广东冷到“结冰”了", "曝俞敏洪邮轮入住价格最高约148万", "日本民众用中文高喊高市早苗下台", "日本官员低头听中方讲话", "硬核实力！大国利器“上新”三连", "福建舰实兵训练更多细节曝光", "“琉球学”研究为什么很有必要", "中国公民赴俄免签政策将于近期生效", "谷歌发布Gemini 3", "哈马斯谴责以军空袭黎巴嫩", "全运会今日看点：乒乓女团决赛来了", "王曼昱因伤退出全运会后续比赛", "2026马年纪念币来了", "JDG老板爆料BLG签下Viper", "荒野求生14位选手进决赛 每人2万奖金", "大风寒潮来袭 4名海上遇险船员获救", "樊振东回应是否期待再次对阵王楚钦"]

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
