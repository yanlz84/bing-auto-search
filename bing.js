// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.149
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
var default_search_words = ["青年大有可为", "今年三伏天10年难遇 有啥讲究", "“上菜像端地雷”的暑假工火了", "巷道里的“中国脊梁”火了", "今天起出门多穿红色衣服", "TVB演员雪妮病逝 其丈夫上月坠亡", "乌克兰首都遭俄袭击陷入火海", "美解除C919发动机出口禁令 中方回应", "在日华人谈日本大地震预言：一笑而过", "2月龄婴儿窒息死亡 检察院起诉生父", "终于知道河南40度的原因", "可以领“国家财政补贴”？假的", "日本末世预言剩1天有人凌晨紧急撤离", "爷爷想下河捞玩具被孙女紧紧拉住", "#末日倒计时日本真会沉没吗#", "幼儿园血铅异常孩子家长发声", "专家解读美取消两项对华出口限制", "日本末世预言仅剩1天 离日旅行增加", "刘芮麟结婚有孩子了", "中方回应美将向不同国家征收新关税", "全国用电负荷4日创历史新高", "雨果因签证问题无缘美国大满贯", "TVB“御用爷爷”周聪因肺炎去世", "外星系不明物体造访太阳系", "利物浦前锋若塔车祸现场一片灰烬", "医生提醒高温天别舍不得开空调", "微信重大更新！聊天记录终于有救了", "夫妻吵架丈夫赌气喝下敌敌畏", "小伙中考720分高二转校职高学烹饪", "日本末日预言将至 有人照常加班", "医生提醒热射病死亡率极高", "商务部：美已取消一系列对华限制措施", "保护手机号隐私 700专用号段将启用", "杨培安做胆囊切除手术", "曝国民女演员爆火内幕", "女子同一公厕两遭趴地偷窥", "俄海军副司令阵亡 驻地内可能有间谍", "乌称俄发射超500架无人机目标基辅", "男子相亲闪婚后发现女方有精神残疾", "13岁女生被多人殴打 警方通报", "原中国中化副总经理冯志斌被查", "警惕“高温杀手”热射病", "因高温天气 苏超调整球员替换程序", "泽连斯基称俄乌领导人会晤不可或缺", "马龙当选全国青联副主席", "赵文琪被骗涉事公司成立不足一年", "今年以来最强高温来袭", "女排2小将已被证实离队转战国青女排", "国乒WTT美国大满贯赛前训练", "EDA对华出口限制解除影响几何", "美众议院表决通过“大而美”法案"]

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
