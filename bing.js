// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.232
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
var default_search_words = ["“两山”理念改变中国引领时代", "高铁站“去泡面化”", "80年前今天日本宣布投降", "这两项贴息政策 关系你我消费开支", "61岁大爷娶小16岁妻子结婚当日脑梗", "没有结婚证能不能领育儿补贴", "印度洋上空现10个神秘黑暗空洞", "中纪委：公职人员禁止干6类副业", "傅首尔亲子言论引家长集体抵制", "石破茂内阁成员参拜靖国神社", "731部队少年兵：忘不掉人体标本画面", "女贪官挖出327枚比特币？纪委回应", "店家回应“3女子带4孩子多次续面”", "95后已经开始“生前整理”了", "外交部回应中国官员取消访日行程", "江西“最强钉子户”搬走", "为什么孩子越来越难睡一个好觉", "现在的退休老人或许比00后还会玩", "胖东来回应小时工穿标识服", "女童调座椅压死弟弟 父母向车企索赔", "重温“小兵张嘎之父”抗战家信", "3女子带4个孩子点一碗面多次续面", "54岁女子腰椎手术后怀孕产女", "“主理人”为啥翻车了", "AI特效太疯狂了 秦始皇强吻北极熊", "遭表姐夫诱骗泰缅边境孕妇被救回国", "#北京下成了暴雨痛城#", "时隔10年中国男篮重返亚洲杯四强", "邱泽许玮甯宝宝出生", "残疾少年在录取通知书送达前病逝", "转发拍娃视频获30万点赞 却上了法庭", "胖东来发布对刑释人员的面试题", "郭德纲自嘲催婚要看郭麒麟脸色", "土拨鼠把加菲猫“拐”进洞？当地回应", "多所高校明确不实行 “非升即走”", "杭州著名主持人谷勇华因病去世", "女子被赌徒前夫当儿子面杀害", "特朗普：与普京会晤失败风险为25%", "中国芯片设备公司起诉美企窃密", "贵州女游客被猴子踢倒骨折", "4人遇涨潮被卷进水流抓住枯树枝求生", "白宫：特朗普希望和平结束俄乌冲突", "租房不备案罚10万？房东们别被误导了", "中国公司起诉美企业窃密 索赔9999万", "舆情应对唯上不唯实是“向上甩锅”", "4人被潮水冲走 抱树枝侥幸脱险", "少年被干冰炸伤手指伤口深可见骨", "北京暴雨牺牲村干部被授予荣誉称号", "高校拟将公厕改造宿舍被吐槽", "普京特朗普将共进工作餐", "防御台风“杨柳” 广东转移超10万人"]

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
