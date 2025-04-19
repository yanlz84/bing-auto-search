// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.23
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

var max_rewards = 50; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 9; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平这样向世界传递中国声音", "美军司令急了：中国速度太快了", "白宫慌了 将设小组处理中美关税危机", "关税冲击下 中国跨境电商更火了", "大学老师因酷似刘亦菲走红", "俄警告德国：此举将被视为直接参战", "机器人跑完马拉松累得坐上轮椅", "女子回应减重30斤后撞脸王祖贤", "男子带10名女子烧烤店就餐后逃单", "雨果用中文幽默回应逆转王楚钦", "多家医院回应“孕妇产下七胞胎”", "王楚钦爆冷出局 无缘世界杯决赛", "天工机器人CEO回应完赛：里程碑意义", "拾荒男子时隔两年上门还账", "又一家企业宣布涨价：只针对美国", "有人贷款17万买黄金盈余过万", "中国卫星脱轨123天画面首次公布", "75cm机器人一路打招呼卖萌", "日本长野一夜连震47次 或有更大地震", "美国各地农民面临破产风险", "美团辟谣骑手去其他平台被永久封号", "Q版机器人也来跑马拉松", "被顶替上大学的女律师回应转行", "牛弹琴：特朗普有点撑不住了", "普京部署大规模兵力 特朗普埋怨", "周琦缺席北京德比G3", "男子试驾撞毁5辆豪车竟是为求职", "这居然是韩庚", "夺冠的天工机器人有啥“秘密武器”", "黄河水不黄了", "机器人马拉松翻车名场面", "阚清子称前几年拍戏女主得男主定", "关税战会否助力印度制造", "山西一国道塌方 死者家属发声", "网传电影《封神2》亏了8.31亿", "宝妈5个月没睡过整觉查出胃癌晚期", "孙珍妮回应脸肿", "巴基斯坦突发5.9级地震", "博主评《借命而生》：肉联厂相亲篇", "“爷孙”机器人组团参加马拉松", "机器人半马起跑前向观众打招呼", "“80后”男子帮老人洗澡月入两万", "宇树科技否认参加机器人马拉松", "消防员刘明竹荣立个人一等功", "广西恒宸球员宁伟辰被禁赛3场", "米切尔谈历史首发5人组", "机器人跑者要人扶 观众：老奶奶来了", "95年小伙练飞针绝技穿透4毫米玻璃", "克莱15投7中砍下18分", "为什么年轻人越来越能接受相亲了", "日本歌手中孝介获不起诉处分"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
