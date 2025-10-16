// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.357
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
var default_search_words = ["粮食安全这件大事 总书记始终牵挂", "中国首颗原子弹为何代号“邱小姐”", "60亿部废旧手机该何去何从", "从“中国制造”到“中国创造”", "缅北刘家强迫女性吸毒", "多地断崖式降温“一夜入冬”", "董宇辉双11三天卖了三个亿", "“玻璃大王”曹德旺卸任 交棒长子", "王健林身家一年缩水820亿元", "辽宁4岁女童翻车窗后失联 正搜救", "政府关门 130万美国大兵断饷了", "“云南鲁甸地震致多人伤亡”不实", "51岁何炅自曝：我现在特别痛苦", "曹德旺回应辞职", "美财长无端指责中方代表 商务部驳斥", "歌手黄小玫去世 上月露面无异样", "全球处于饥饿人数已达创纪录水平", "互联网大佬扎堆做酒店生意", "AL战胜GEN", "“12327”热线正式开通运行", "当地回应居民被要求上交家门钥匙", "人类未出现时的二氧化碳浓度再现", "云南咖啡主理人路边咖啡火出圈", "上海机场2名外国人躺卧霸占6个座", "7次开庭5次重审 案件陷入30年循环", "“内鬼”何衍雄主动投案", "“我听交警的”事件涉事女子被行拘", "中方回应“美呼吁盟友去中国化”", "中方管制稀土是维护世界和平", "27岁白俄女子被模特招聘骗到缅北", "外卖应对无堂食商家加专属标识", "CFO爆冷战胜T1", "广西一地“洪水围村”十余天", "澳大利亚热带雨林吸碳变排碳", "董明珠回应被指“霸道”：私下很可爱", "又有美高校“硬刚”特朗普政府", "女子酒后走捷径坠亡 同饮者不担责", "首秀直博会 直-20T“凌空画凤凰”", "中国冰雪产业规模将突破一万亿元", "乌军方称袭击俄萨拉托夫炼油厂", "揭秘缅北最赚钱的家族园区真相", "中方回应英国将多家中企列实体名单", "冷得猝不及防 十余省份急需秋裤护体", "郝龙斌晒合影称感谢王金平倾囊相授", "女子用加热艾草包热敷竟自燃起火", "“玲龙一号”全球首堆冷试成功", "菲侦察机侵闯黄岩岛领空 中方驱离", "搞团团伙伙 3名落马官员同日被处理", "TES战胜100T豪取2连胜", "瑞士轮TES击败100T豪取两连胜", "烈士聂曦史料研究工作已展开"]

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
