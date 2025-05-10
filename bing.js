// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.38
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
var default_search_words = ["习近平同普京出席红场阅兵式", "巴基斯坦称正式对印度发起军事行动", "别再逼着消费者大喊转人工了", "“中国排面”一步一帅", "“中国罕见提出大规模采购意向”", "银行买到掺假金条？工行回应", "朱自清《荷塘月色》被检出高AI率", "雷军：过去一个多月是我最艰难的时间", "结婚离婚为什么不需要户口本了", "经济大省挑大梁", "5月10日起结婚离婚不需要户口本", "西安冰雹是人工增雨导致？假", "巴空军基地遭印导弹袭击 火光冲天", "普京与解放军仪仗司礼大队政委握手", "俄女兵亮相红场：短裙军装 英姿飒爽", "巴基斯坦关闭全部领空", "美国被曝将请求中国取消稀土限制", "中方同意与美方接触的3个考虑", "4岁女童被蜜蜂蛰伤致死 爸爸哭诉", "西安雷雨夜再现“龙形”不明飞行物", "印称巴派300至400架无人机发动攻击", "江疏影工作室回应：呵呵", "赵心童谈50万磅冠军奖金怎么花", "21岁特巡警7秒救下一条命", "巴基斯坦称已摧毁77架印度无人机", "贵州发现罕见幽灵之花", "院方：3岁女童确诊铊中毒系去年病例", "王健林再被冻结3亿股权", "王汉龙：选择中国国籍的态度很坚决", "5名小孩哥带警察去扫毒", "法国纪念二战胜利80周年 马克龙发声", "巴基斯坦旁遮普省传出巨大爆炸声", "75岁董事长赤膊秀肌肉代言抗衰产品", "胜利日红场阅兵 普京讲话有何不同", "#中美关税战特朗普为何突然服软#", "普京在红场与朝鲜军官拥抱握手", "雄姿英发！中国仪仗队步入莫斯科红场", "冯德莱恩称谈判前不会赴美见特朗普", "莱利首次回应巴特勒交易", "日本地铁砍人嫌犯：特意选东大附近", "原声直击：多架歼-10实战硬刚外军机", "美贸易政策多变德国工业再受挫", "保总统提议就加入欧元区举行公投", "纽北赛道将设置“小米弯道”", "云南一地灌溉河疑遭污染水变黑", "货车司机服务区吃菌菇中毒险丧命", "特朗普：鲍威尔不降息是因为不爱我", "何超莲回复窦骁生日祝福", "BBR预测雷霆夺冠概率63.8%", "iPhone17Air参数公开", "以军称打死一名杰哈德高级领导人"]

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
