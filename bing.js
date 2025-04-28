// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.14
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
var default_search_words = ["这封抗战家书 习近平深情诵读", "中纪委通报三河招牌改色事件", "快递员入职京东13年工资共100多万", "这件事再次让世界看到中国的靠谱", "张译决定暂时息影", "“跑马市长”刘佳晨被免职", "深圳“兔子警官”爆火出圈了", "沈腾颁奖又出名场面", "特朗普支持率为80年来美总统最低", "刘若英演唱会秒变“大型蹦迪现场”", "江苏台报道野猪冲进江苏电视台", "登顶泰山最高可得3万奖金？假", "男子在生殖医院手术后身亡 家属发声", "游客私摘枇杷每个被索赔100元", "华西医院实现首创穿刺切除肺结节", "关晓彤亮相华表奖 造型引热议", "刘青云四封金像奖影帝", "曹骏有一种没受过互联网毒害的美", "金价飙涨致备婚三金成本激增", "凯尔特人vs魔术", "女子回应赤脚踏入万年晶花池拍照", "高颜值女通缉犯出狱当主播账号已封", "石凯发文回应恋情风波", "华表奖获奖名单汇总", "泸州老窖去年营收约312亿元", "斯诺克世锦赛：赵心童13-10雷佩凡", "黄晓明吴磊范丞丞飚方言", "市场监管总局再回应“李嘉诚卖港口”", "2025款奔驰GLS上市", "尼克斯94-93逆转活塞 大比分3-1领先", "张译华表影帝获奖感言：我爱中国电影", "专家：李嘉诚不缺钱 缺家国情怀", "王钰栋：上次进球后庆祝了很过意不去", "男子乘高铁中途下车抽烟结果车走了", "刘亦菲陈晓李现同框", "雷佳音眉毛好像当代李逵", "土耳其外长会见哈马斯高层", "曹骏被评有种没受过互联网毒害的美", "伊朗港口爆炸与石油设施无关", "以军对黎巴嫩贝鲁特南郊发动打击", "王俊凯杨超越谈首次合作感受", "成龙教章子怡山东话", "曝石凯帮依依还房贷", "前线哨所突发走火 韩向朝紧急通报", "碧桂园出售蓝箭航天股份", "女子赤脚踏入4.8亿年地下水晶宫", "美关税政策的背后推手都有谁？", "上海车展 辅助驾驶供应商“上主桌”", "《五哈》体验新疆婚礼笑点好足", "萨拉赫与球迷自拍庆祝进球", "宋龙当选青岛海牛2-3月最佳球员"]

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
