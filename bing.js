// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.96
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
var default_search_words = ["不负青春 不负韶华", "特朗普：我和马斯克的关系已经结束了", "济南一烤鸭店陪考停业告示火了", "破万亿 以旧换新助推消费升级", "长沙暴雨：楼梯成瀑布 积水没过轮胎", "《浪姐》成团名单揭晓 叶童总冠军", "直击高考第二天", "遭遇重大伤亡后 瓦格纳集团宣布撤军", "中国游客在日本闹市被砍 中使馆发声", "五胞胎同时参加高考 50多万学费被免", "李盈莹为高考学子加油", "武夷山一女游客被蛇咬死？假", "牙医3年前预警韦东奕牙周危机成真", "辽宁男篮张镇麟低调完成婚礼", "考生被智能锁困家中 消防2分钟开锁", "哥伦比亚总统候选人遭枪击 情况危急", "单依纯回应“疯了”：这是艺术", "尔冬升一眼就定了哈妮克孜演薛芳菲", "《藏海传》里的蛇眉铜鱼真的存在吗", "赵普呼吁北大关心干预“韦神”健康", "票数也太低了 李晟：我也这么觉得", "国乒总教练李隼嫁女 3位大魔王哭了", "显眼包弟弟穿红绿色旗袍助考姐姐", "马斯克删除特朗普涉爱泼斯坦案帖子", "弟弟穿教科书套装为哥哥送考", "“韦神”的健康北大有责任？律师分析", "男生高考数学第1个出考场：先打游戏", "考场外现机器人穿旗袍送考", "王传福：我们绝不拉踩同行这是原则", "游客被围殴后 县长开会全县整治", "乌官员称俄罗斯一座关键炼油厂起火", "孙俪发长文庆祝结婚周年 疑辟谣移民", "德国慕尼黑发生持刀袭击事件", "俄称发动集群打击 乌称击落俄战机", "国内部分品牌金饰跌破千元", "山东女生考完称数学整体比较简单", "高志凯：该跟印度人讲清楚中印边界了", "高考生躺路边午休 家长在旁扇扇子", "打非遗女人拳大爷担心整套拳法失传", "男生第一个走出考场：数学题目太难了", "杨学良：内卷者不改汽车产业不能变强", "强风暴持续 超4000万美国人受影响", "曾高考16次的唐尚珺到考场外加油", "王俊凯王勉《五哈》体验皮肤检测", "北大教授张颐武评析今年高考作文题", "《浪姐》到底谁在投票", "牛弹琴：莫迪高兴了 终于等到了电话", "中国战机实力“圈粉”全球客户", "高考生因智能门锁故障被困 消防破门", "汪峰带一双儿女逛街", "实探茅台镇：大订单少了 不堵车了"]

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
