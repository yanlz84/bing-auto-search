// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.86
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
var default_search_words = ["字里行间的中华基因", "缺氧离世司机有5孩上学 民政局介入", "未被邀请 莫迪或6年来首缺席G7峰会", "天问二号第一站为何要拜访它", "周星驰导演电影《女足》杀青", "18万人口德国小城为何吸引樊振东", "贾冰成功减肥后睡觉不打呼噜了", "韩国新任总统或明日宣誓就职", "入户调查已开始 请积极配合", "这几种“奇葩果” 买了就后悔", "宋雨琦回应开场没压力", "南京“以债换房”可置换月供？假", "漫展上两女童被指衣着暴露 家长在场", "经销商关店 80多辆电动车被远程锁死", "土总统称俄乌二轮谈判取得重大成果", "美股收涨 世纪铝业涨超21%", "余承东和雷军疑似隔空喊话", "第二轮谈判结束 俄代表团团长发声", "“散装江苏”藏都不藏了", "樊振东德国看球笑容满面", "德约科维奇法网100胜 晋级8强", "男子将放学女童拖进小巷 被拘15日", "谈判结束后乌方发声：已向俄递交名单", "日本警告：北海道附近可能发生强震", "韩国大选开始投票 5人竞逐总统", "俄军地毯式轰炸乌无人机发射场", "男网红直播家暴妻子 本人回应", "张帅晋级法网混双四强", "俄乌谈判草草结束 细看条件都够狠", "蒙古国议会解除总理奥云额尔登职务", "夏天这种凉鞋易致孩子性早熟还有毒", "辛纳横扫卢布列夫晋级法网八强", "国足抵达雅加达备战世预赛", "意大利埃特纳火山喷发", "外卖员不用办健康证了？网友吵翻", "女子被逼复婚又屡遭家暴", "王楚钦与女粉丝合影手立马放背后", "俄民众投石块砸乌无人机 州长：奖励", "尊界S800上市三天大定达2600台", "银河证券：短期A股市场或仍维持震荡", "谈判现场曝光 俄团长冷眼审视乌代表", "韩国大选三强对决 李在明领跑", "这部剧火得太及时了", "美提高钢铝关税至50% 欧盟深表遗憾", "马克龙笑容满面邀妻子与球队合影", "《韶华若锦》大结局", "镇政府回应吉林松原一地现龙卷风", "欧盟起草对俄第18轮制裁措施", "国际组织：美债务飙升不仅危及自身", "中金：端午节后A股走势或震荡为主", "乌希望停火30天俄只同意2到3天"]

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
