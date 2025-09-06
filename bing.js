// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.277
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
var default_search_words = ["九三阅兵上这些旗帜令人心潮澎湃", "球还没开踢 友谊的小船已经翻了", "大学毕业生做体育外卖月营收近10万", "九三阅兵“神级镜头”是这样切换的", "美国突然不好玩了", "丝瓜汤是什么梗", "异地恋十年 男子穿军装来接退役女友", "“反诈老陈”账号被封", "特朗普：休息一天就被传总统出事了", "全国肥胖率分布地图出炉", "韩外长证实：300多名韩国人在美被捕", "广州辟谣“小程序可办排污登记”", "江祖平自曝遭性侵 男方回应", "男子不满13条狗半夜叫 毒死9只获刑", "演员黄泽锋报喜：58岁妻子诞下二胎", "幼儿误吞电池10小时致终身残疾", "谢娜晒爸妈金婚全家福", "中国驻日本大使馆介绍东风-5C", "交给国家两年 小哭包爆改硬汉型男", "中使馆：希望菲防长能睁眼看世界", "警方介入调查江祖平遭性侵案", "李世民扮演者景区跳科目三：我缺钱", "那些到期不续租的网约车司机", "面馆推“茅台配板面”套餐 一杯38元", "张维伊婚礼给去世父母留了座位", "今年已有9名正部级官员落马", "鲍蕾和陆毅在一起30年没做过饭", "特朗普回应委战机挂弹飞越美驱逐舰", "银川夜空现“七彩祥云”", "闪婚妻子隐瞒10年精神病史 拒还彩礼", "许奶奶已经不是当年的许奶奶了", "牛弹琴：特朗普又要开搞欧洲了", "董璇说不会把钱都给张维伊", "乌克兰难民在美轻轨上被刺身亡", "特朗普称无需担心美印关系 莫迪回应", "厦门健身房教练被两名女子当众掌掴", "周末花钱进“大厂”的年轻人玩疯了", "饭桌上强收份子钱 特朗普办鸿门宴", "杜兰特悄悄为脑瘤女孩支付手术费", "泰总理阿努廷公布多名内阁部长人选", "菲律宾防长发表涉华言论 中使馆回应", "刘亦菲迪丽热巴同框相视一笑", "直击苏超：无锡vs连云港", "遇到疑似迷路的和平鸽该怎么办", "美军被指杀死朝鲜平民 特朗普回应", "直击苏超：南京vs徐州", "泽连斯基提议：普京可以来基辅", "家长要求学生周末单休合理吗", "小学生被球击中远视力仅剩0.04", "托运狗死在车上 狗主人索赔9000元", "易会满曾多次强调反腐倡廉"]

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
