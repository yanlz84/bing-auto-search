// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.293
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
var default_search_words = ["伟大精神丰碑永铸", "美国丢了大单", "王毅表态：中方不参与不策划战争", "一面面战旗背后有什么故事", "央视起底肉毒素暴利黑链", "剃光头直播跳舞筹钱妈妈：儿子已离世", "坐高铁20分钟弄丢13.8万手镯", "省委书记率团访问 坐进飞机驾驶室", "“一杯奶茶钱”迷惑了多少人", "这样的“搭把手”你还敢吗", "孙颖莎4-3击败王曼昱夺冠", "9月起购房无需交维修资金系谣言", "武契奇：受邀访华开心得差点跳起来", "载5名中国人车队非洲遇袭 1人被绑架", "10年消失超8万家 KTV被抛弃了吗", "陪看WTT：王楚钦决赛再战雨果", "上市没几天iPhone 17已跌破发售价", "住房租赁新规来了 如何影响你我", "冷空气已启程 降温可直达南方", "北京这场冰雹为何如此猛烈", "马斯克“意外现身”伦敦大规模抗议", "电影《731》将在全球多地上映", "女子称贷款100多万中介收31万", "沈阳马拉松冠军在领奖台上晕倒", "220万买的“教训”能否叫醒装睡的人", "人民日报发文谈预制菜", "许光汉被吐槽健身过度失去少年感", "伦敦超10万人示威 多人与警察互殴", "轿车视野盲区能“藏”93个孩子", "#全球第二网红追哪吒追到重庆了#", "女子长期克隆他人朋友圈用于网恋", "无语哥看川剧变脸惊呼尖叫", "#无语哥被重庆火锅辣出新表情包#", "东部战区：把胜利的旗帜插在宝岛上", "“太乙真人”教无语哥说重庆话", "哈尔滨大晴天突降冰雹", "林德：没想到能再次战胜世界第一", "俄罗斯海军“去航母化”", "持铁锤砸路人致死男子有精神分裂症", "音乐节满地泥泞如“插秧节”", "预制菜之王萨莉亚为啥没人骂", "普京授予梅德韦杰夫祖国功绩勋章", "2岁女童家门口失踪超10天", "韩国中小学班级人数为何不减反增", "王楚钦决赛再战雨果", "兰州一高校硬核军训堪比大片", "30岁出头！歼-35研发人员好年轻", "意大利97天暑假结束仍热得上不了学", "俄演习中发射“锆石”高超音速导弹", "王楚钦给了自己脸一下", "全红婵向学院赠送签名奥运出场服"]

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
