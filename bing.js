// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.71
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
var default_search_words = ["总书记谈精神文明建设", "普京所乘直升机遭无人机大规模袭击", "马克龙被老婆打脸 看见镜头后秒微笑", "临近端午 各地节日氛围愈发浓厚", "这家5元自助快餐店因一条差评火了", "杭州那只外逃4年的豹子怎样了", "今年争议最大的国产剧来了", "iPhone19或迎真全面屏", "玲花也不唱了 曾毅惊呆", "穆迪维持中国主权信用评级 中方回应", "郝蕾：演员不红就是原罪", "研究生夫妻抱孩子从25楼跃下？假", "李微微从教师到正处级干部仅用4年", "林俊杰演唱会突发意外", "定了！天问二号5月29日发射", "邱贻可晒与孙颖莎蒯曼合影", "6.8元网购10斤花生米到手只有10粒", "王楚钦夺冠后肖指导哭成了小孩", "伊能静穿抹胸裙拍广告造型臃肿", "刘亦菲提名白玉兰最佳女主角", "张小婉左凌峰疑似甜蜜同居", "王健林已被冻结4.9亿股权", "港星发文求工作 或因欠租无家可归", "连续三天23点半后入睡就是熬夜", "印媒：低估了中国稀土战略韧性", "男子赴孟加拉国娶妻身亡 家属发声", "医学泰斗病逝当天还在医院上班", "第30届白玉兰奖入围名单出炉", "孟羽童被多次造黄谣 警方立案", "优衣库大搞辣妹风 抛弃普通人", "小沈阳把张百乔拉黑了", "成都女子家门口遇害案细节曝光", "深圳一沙滩海鲜“上岸” 游客捡百斤", "易烊千玺被戛纳外媒喊到憋不住笑", "成都女子在家门口被害案将开庭", "女生宿舍5人全员推免“双一流”", "贾玲全资持股大碗娱乐", "王励勤制定国乒新计划", "中国将撒哈拉沙漠改造成甜菜农场", "中方回应是否会向日本租借新熊猫", "外资银行也开始降息了", "孙颖莎躺下的汗水印出China字样", "女子花数万元上心理提升班被同学骂", "国乒顺利回国", "孙颖莎回应双冠：继续为国而战", "乌克兰遭三百余架无人机袭击", "香港高校接力招揽哈佛国际生", "谢娜：小朋友你长大一点再来看哟", "小米玄戒负责人回应设计方案", "端午节3天：不调休 高速不免费", "华为Pura80 Pro主摄曝光"]

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
